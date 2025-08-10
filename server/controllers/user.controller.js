const userModel = require("../models/user.model");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Environment variables should be in your .env file
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const signupController = async (req, res, next) => {
  try {
    // Validate request body using express-validator

    const { userName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new userModel({
      userName,
      email,
      password: hashedPassword,
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Create token payload (don't include sensitive info)
    const tokenPayload = {
      id: savedUser._id,
      email: savedUser.email,
      userName: savedUser.userName,
    };

    // Generate JWT token
    const token = JWT.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Omit password from response
    const userResponse = {
      id: savedUser._id,
      userName: savedUser.userName,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
    };

    return res.status(201).json({
      success: true,
      message: "User successfully registered",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create token payload
    const tokenPayload = {
      id: user._id,
      email: user.email,
      userName: user.userName,
    };

    // Generate JWT token
    const token = JWT.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Omit password from response
    const userResponse = {
      id: user._id,
      userName: user.userName,
      email: user.email,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  signupController,
  loginController,
};
