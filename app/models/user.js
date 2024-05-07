const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required!"],
  },
  email: {
    type: String,
    unique: [true, "Email already exists!"],
    required: [true, "Email is required!"],
  },
  password: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  registrationMethod: {
    type: String,
    required: [true, "RegistrationMethod is required!"],
  },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;
