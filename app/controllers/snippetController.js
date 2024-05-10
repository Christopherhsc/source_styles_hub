const Snippet = require("../models/snippet");

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
exports.createSnippet = (req, res) => {
  const {
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
  } = req.body;

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

  newSnippet
    .save()
    .then(() => res.json("Snippet added!"))
    .catch((err) => res.status(400).json("Error: " + err));
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
