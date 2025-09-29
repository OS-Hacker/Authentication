const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  emailVerified: { type: Boolean, default: false },
  // verify account
  emailVerificationToken: String,
  emailVerificationTokenExpires: Date,
  // password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
