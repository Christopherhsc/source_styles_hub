// app/controllers/userController.js
const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const axios = require('axios');

const saltRounds = 10;

exports.getUser = (req, res) => {
  User.findById(req.params.id)
    .select('-password') // Exclude password from the results
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user, loginCount: user.loginCount });
    })
    .catch(err => res.status(500).json({ message: "Error retrieving user", error: err }));
};


exports.createUser = (req, res) => {
  let { email, username, imageUrl, password, registrationMethod } = req.body;
  email = email.toLowerCase(); // Normalize the email to lowercase

  User.findOne({ email: email })
    .then((existingUser) => {
      if (existingUser && registrationMethod === "SCP") {
        return res.status(400).json({ message: "Email is already in use" });
      }

      const saveOrUpdateUser = (hashedPassword) => {
        if (existingUser && registrationMethod === "GOOGLE") {
          // Existing user with GOOGLE method, update the info and increment login count
          existingUser.username = username;
          existingUser.imageUrl = imageUrl;
          if (hashedPassword) existingUser.password = hashedPassword; // Update password if provided
          existingUser.loginCount += 1; // Increment login count here
          existingUser.save() // Save the updates
            .then((updatedUser) => res.json(updatedUser))
            .catch((err) => res.status(400).json("Error: " + err));
        } else {
          // No existing user or not GOOGLE, create new user
          const newUser = new User({
            email,
            username,
            imageUrl,
            registrationMethod,
            loginCount: 1, // Start with 1 login count for new user
            ...(hashedPassword && { password: hashedPassword }),
          });

          newUser.save() // Save the new user
            .then((user) => res.json(user))
            .catch((err) => res.status(400).json("Error: " + err));
        }
      };

      // Handle password encryption if password is provided
      if (password) {
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
          if (err) return res.status(500).json("Error hashing password: " + err);
          saveOrUpdateUser(hashedPassword);
        });
      } else {
        // If no password is needed (like in GOOGLE login), pass null for hashedPassword
        saveOrUpdateUser(null);
      }
    })
    .catch((err) => {
      res.status(500).json("Error: " + err);
    });
};

exports.loginUser = (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase(); // it's for searching

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ message: "Error during authentication" });
        }

        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // login count for users
        user.loginCount += 1;
        user.save().then(() => {
          const userObject = user.toObject();
          delete userObject.password; // Remove password for security
          res.json(userObject);
        }).catch(err => {
          res.status(500).json({ message: "Error updating login count", error: err });
        });
      });
    })
    .catch((err) => {
      console.error("Error during login process:", err);
      res.status(500).json("Error: " + err);
    });
};

exports.proxyProfileImage = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "Missing 'userId' query parameter" });
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.imageUrl) {
      return res.status(404).json({ message: "User not found or missing profile image" });
    }

    const imageUrl = user.imageUrl;

    if (imageUrl.startsWith('data:')) {
      // If the image URL is already in base64 format
      const base64Data = imageUrl.split(',')[1];
      const imgBuffer = Buffer.from(base64Data, 'base64');
      const mimeType = imageUrl.split(';')[0].split(':')[1];

      res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Length': imgBuffer.length
      });
      res.end(imgBuffer);
    } else {
      // Proxy external image using axios
      const response = await axios.get(imageUrl, { responseType: 'stream' });
      response.data.pipe(res);
    }
  } catch (err) {
    console.error('Error fetching profile image:', err.message);
    res.status(500).json({ message: 'Failed to fetch image' });
  }
};

exports.trackProfileVisit = async (req, res) => {
  try {
    const { profileUserId } = req.params;
    const { visitorUserId } = req.body;

    if (profileUserId === visitorUserId) {
      // Prevent counting if the user is viewing their own profile
      return res.status(200).json({ message: 'Own profile visit, not counted' });
    }

    const now = new Date();
    const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const user = await User.findById(profileUserId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const visitor = user.visitors.find(v => v.visitorId === visitorUserId);

    if (!visitor) {
      user.visitors.push({ visitorId: visitorUserId, lastVisit: now });
    } else if (visitor.lastVisit < past24Hours) {
      visitor.lastVisit = now;
    }

    await user.save();
    res.status(200).json({ message: 'Visitor tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking profile visit', error });
  }
};