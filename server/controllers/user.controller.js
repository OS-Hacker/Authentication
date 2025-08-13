const userModel = require("../models/user.model");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../util/SendEmail");

// Configuration constants
const JWT_SECRET = "HDHDHDHDHDHD";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const SALT_ROUNDS = 12;

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */
const signupController = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn(`Validation errors in signup: ${errors.array()}`);
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { userName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      logger.warn(`Signup attempt with existing email: ${email}`);
      return res.status(409).json({
        success: false,
        message: "User already exists. Please login instead.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationTokenExpires =
      Date.now() + EMAIL_VERIFICATION_EXPIRY;

    // Create new user
    const newUser = new userModel({
      userName,
      email,
      password: hashedPassword,
      emailVerified: false,
      emailVerificationToken,
      emailVerificationTokenExpires,
    });

    // Save user to database
    const savedUser = await newUser.save();
    logger.info(`New user created: ${savedUser._id}`);

    // Create verification URL
    const verificationUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/verify-email/${emailVerificationToken}`;

    // Send verification email
    try {
      await sendEmail({
        email: savedUser.email,
        subject: "Verify Your Email Address",
        template: "email-verification",
        context: {
          userName: savedUser.userName,
          verificationUrl,
          supportEmail: "support@example.com",
        },
      });

      // Prepare response without sensitive data
      const userResponse = {
        id: savedUser._id,
        userName: savedUser.userName,
        email: savedUser.email,
        createdAt: savedUser.createdAt,
        emailVerified: savedUser.emailVerified,
      };

      return res.status(201).json({
        success: true,
        message:
          "Registration successful. Please check your email to verify your account.",
        user: userResponse,
      });
    } catch (emailError) {
      // Rollback user creation if email fails
      await userModel.findByIdAndDelete(savedUser._id);
      logger.error("Email sending failed during signup:", emailError);
      return res.status(500).json({
        success: false,
        message:
          "Could not send verification email. Please contact support or try again later.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during registration",
    });
  }
};

/**
 * @desc    Authenticate user and get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email (including password for comparison)
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
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
      role: user.role || "user", // Default role if not specified
    };

    // Generate JWT token
    const token = JWT.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Set secure HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    // Prepare user response without sensitive data
    const userResponse = {
      id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token, // Also send token in response for mobile clients
    });
  } catch (error) {
      return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during login",
    });
  }
};

/**
 * @desc    Verify user email
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user by verification token
    const user = await userModel.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Update user as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    user.verifiedAt = new Date();
    await user.save();


    // Create token payload
    const tokenPayload = {
      id: user._id,
      email: user.email,
      userName: user.userName,
      role: user.role || "user",
    };

    // Generate JWT token
    const authToken = JWT.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Set cookie and redirect for web clients
    res.cookie("token", authToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    // For API clients
    return res.status(200).json({
      success: true,
      message: "Email successfully verified",
      token: authToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during email verification",
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMeController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  signupController,
  loginController,
  verifyEmailController,
  getMeController,
};
