const Snippet = require("../models/snippet");
const User = require('../models/user');

// GET
exports.getUserSnippets = (req, res) => {
  const { userId } = req.params;
  Snippet.find({ userId })
    .then((snippets) => {
      res.json(snippets);
    })
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.getAllSnippets = (req, res) => {
  Snippet.find()
    .then((snippets) => res.json(snippets))
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.getRandomSnippets = (req, res) => {
  Snippet.aggregate([{ $sample: { size: 12 } }])
    .then((snippets) => res.json(snippets))
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.getSnippetById = (req, res) => {
  const { snippetId } = req.params;

  Snippet.findById(snippetId)
    .then((snippet) => {
      if (!snippet) {
        return res.status(404).json("Error: Snippet not found.");
      }
      res.json(snippet);
    })
    .catch((err) => res.status(400).json("Error: " + err));
};

// POST
exports.createSnippet = async (req, res) => {
  try {
    const {
      userId,
      title,
      picture,
      pictureWidth,
      pictureHeight,
      description,
      snippetTemplate,
      snippetStyle,
      tags,
      username,
      email,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const snippets = await Snippet.find({ userId });
    let maxSnippets;
    switch (user.role) {
      case 1:
        maxSnippets = 5;
        break;
      case 2:
        maxSnippets = 15;
        break;
      case 3:
        maxSnippets = Infinity; // Admins can create unlimited snippets
        break;
      default:
        return res.status(400).json({ message: "Invalid user role" });
    }

    if (snippets.length >= maxSnippets && maxSnippets !== Infinity) {
      return res
        .status(403)
        .json({ message: `Limit of ${maxSnippets} snippets reached` });
    }

    const newSnippet = new Snippet({
      title,
      picture,
      pictureWidth,
      pictureHeight,
      description,
      snippetTemplate,
      snippetStyle,
      tags,
      userId,
      username,
      email,
    });

    await newSnippet.save();
    res.json("Snippet added!");
  } catch (err) {
    console.error("Error creating snippet:", err); // Log detailed error
    return res
      .status(500)
      .json({ message: "Error creating snippet", error: err.toString() });
  }
};

// DELETE
exports.deleteSnippet = (req, res) => {
  const userIdFromRequest = req.headers["user-id"];

  if (!userIdFromRequest) {
    return res.status(401).json("Unauthorized: No user information found.");
  }

  const { snippetId } = req.params;

  // Find the snippet by ID
  Snippet.findById(snippetId)
    .then((snippet) => {
      if (!snippet) {
        return res.status(404).json("Error: Snippet not found.");
      }

      if (snippet.userId.toString() !== userIdFromRequest.toString()) {
        return res
          .status(401)
          .json("Error: Unauthorized to delete this snippet.");
      }

      // Use findByIdAndDelete to remove the snippet
      Snippet.findByIdAndDelete(snippetId)
        .then(() => res.json("Snippet deleted."))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
};
