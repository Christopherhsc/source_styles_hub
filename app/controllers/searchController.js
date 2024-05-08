const Snippet = require("../models/snippet");
const User = require("../models/user");

exports.search = async (req, res) => {
  const { term } = req.query;
  try {
    const snippets = await Snippet.find({
      $or: [
        { title: { $regex: term, $options: "i" } },
        // { description: { $regex: term, $options: "i" } },
        { tags: { $regex: term, $options: "i" } },
        { username: { $regex: term, $options: "i" } },
        // { email: { $regex: term, $options: "i" } },
      ],
    });
    const users = await User.find({
      $or: [
        { username: { $regex: term, $options: "i" } },
        // { email: { $regex: term, $options: "i" } },
      ],
    });
    res.json({ snippets, users });
  } catch (error) {
    res.status(500).json({ message: "Error searching", error });
  }
};
