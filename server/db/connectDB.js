const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.connect("mongodb://127.0.0.1:27017/userDB");
    console.log("db connected successfully");
  } catch (error) {
    console.log(error);
    // Handle error (e.g., log it, send an alert, etc.)
    process.exit(1);
  }
};

module.exports = connectDB;
