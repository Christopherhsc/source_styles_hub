const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const axios = require('axios');

const saltRounds = 10;

exports.getUser = (req, res) => {
  User.findById(req.params.id)
      .select('-password')
      .then(user => {
          if (!user) {
              return res.status(404).json({ message: "User not found" });
          }
          res.json(user);
      })
      .catch(err => res.status(500).json({ message: "Error retrieving user", error: err }));
};

exports.createUser =
  ("/new",
  (req, res) => {
    const { email, username, imageUrl, password, registrationMethod } =
      req.body;

      console.log(`Registration request received for email: ${email} using method: ${registrationMethod}`)

    User.findOne({ email: email })
      .then((existingUser) => {
        if (existingUser && registrationMethod === "SCP") {
          // If the user already exists and the registration method is SCP, return an error
          return res.status(400).json({ message: "Email is already in use" });
        }

        const saveOrUpdateUser = (hashedPassword) => {
          // If the user exists and the registration method is GOOGLE, update the user
          if (existingUser && registrationMethod === "GOOGLE") {
            existingUser.username = username;
            existingUser.imageUrl = imageUrl;
            if (hashedPassword) existingUser.password = hashedPassword;
            existingUser
              .save()
              .then((updatedUser) => res.json(updatedUser))
              .catch((err) => res.status(400).json("Error: " + err));
          } else {
            // If the user doesn't exist, create a new user
            const newUser = new User({
              email,
              username,
              imageUrl,
              registrationMethod,
              ...(hashedPassword && { password: hashedPassword }),
            });

            newUser
              .save()
              .then((user) => res.json(user))
              .catch((err) => res.status(400).json("Error: " + err));
          }
        };

        // If a password is provided, hash it before saving/updating the user
        if (password) {
          bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err)
              return res.status(500).json("Error hashing password: " + err);
            saveOrUpdateUser(hashedPassword);
          });
        } else {
          saveOrUpdateUser(null);
        }
      })
      .catch((err) => {
        res.status(500).json("Error: " + err);
      });
  });

  exports.loginUser =
  ("/login",
  (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          console.log("User not found for:", email);
          return res.status(404).json({ message: "User not found" });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Error during authentication" });
          }

          if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
          }

          console.log(`User logged in successfully: ${email}`);

          // Convert the Mongoose document to a plain JavaScript object
          const userObject = user.toObject();

          // Remove password property from the object before sending it in the response
          delete userObject.password;

          res.json(userObject);
        });
      })
      .catch((err) => {
        console.log("Error during login process:", err); // Log any other error
        res.status(500).json("Error: " + err);
      });
  });

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