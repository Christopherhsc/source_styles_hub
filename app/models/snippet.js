const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema({
  title: String,
  picture: String,
  pictureWidth: Number,
  pictureHeight: Number,
  description: String,
  snippetTemplate: String,
  snippetStyle: String,
  tags: String,
  username: String,
  email: String,
  userId: String,
});

module.exports = mongoose.model("Snippet", snippetSchema);
