const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required']  // Providing an error message is optional but helpful
  },
  picture: {
    type: String,
    required: [true, 'Picture URL is required']
  },
  pictureWidth: Number,
  pictureHeight: Number,
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  snippetTemplate: {
    type: String,
    required: [true, 'Snippet template is required']
  },
  snippetStyle: String,
  tags: String,
  username: String,
  email: String,
  userId: String,
});

// Compile the model from the schema
const Snippet = mongoose.model('Snippet', snippetSchema);

module.exports = Snippet;