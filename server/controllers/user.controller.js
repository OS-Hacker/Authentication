const userModel = require("../models/user.model");
const { validationResult } = require("express-validator");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/SendEmail");
const forgotPasswordTemplate = require("../templates/ForgotPasswordTemplate");
const { ErrorHandler } = require("../utils/ErrorHandler");
const {
  generateAccessToken,
  generateRefreshToken,
  sendVerificationEmail,
  storeEmailToken,
  generateEmailToken,
  generateResetPasswordToken,
} = require("../utils/GenerateTokens");
const TokenModel = require("../models/Token.model");
const { storeRefreshToken } = require("../utils/GenerateTokens");

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */

const signupController = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { userName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return next(
        new ErrorHandler("User already exists. Please login instead.", 400)
      );
    }

    // Create new user
    const newUser = new userModel({
      userName,
      email,
      password, // Will be hashed by pre-save middleware
      emailVerified: false,
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Generate email verification token
    const emailToken = generateEmailToken(savedUser._id);
    await storeEmailToken(savedUser._id, emailToken);

    // Send verification email
    await sendVerificationEmail(emailToken, req.body.email);

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
  } catch (error) {
    console.log("Signup error:", error);
    next(new ErrorHandler(error));
  }
};

/**
 * @desc    Verify user email
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */

// verify token they sended in email
const verifyEmailController = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return next(new ErrorHandler("Verification token is required", 400));
    }

    let decoded;
    try {
      decoded = JWT.verify(token, process.env.EMAIL_TOKEN_SECRET);
    } catch (jwtError) {
      return next(new ErrorHandler("Invalid or expired token", 400));
    }

    console.log("decoded - ", decoded);

    // Find token in database
    const tokenRecord = await TokenModel.findOne({
      userId: decoded?.userId,
      token,
      type: "email-verification",
      expiresAt: { $gt: new Date() },
    });

    console.log("tokenRecord - ", tokenRecord);

    if (!tokenRecord) {
      return next(new ErrorHandler("Invalid or expired token", 400));
    }

    // Find user and update emailVerified status
    const user = await userModel.findById(decoded.userId);

    console.log("user - ", user);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        message: "Email is already verified. Please log in.",
      });
    }

    user.emailVerified = true;
    await user.save();

    // Remove used token
    // await TokenModel.findByIdAndDelete(tokenRecord?._id);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    next(new ErrorHandler(error));
  }
};

/**
 * @desc    Authenticate user and get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const loginController = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userModel.findOne({ email });

    console.log(user);

    if (!user) {
      return next(new ErrorHandler("Invalid credentials", 400));
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Option 1: Block login completely
      return next(
        new ErrorHandler(
          "Please verify your email address before logging in. Check your email for verification link.",
          403
        )
      );
    }

    // Compare password using model method
    // comparePassword methoad i called below the schema
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid credentials", 400));
    }

    // Create token payload
    const tokenPayload = {
      id: user.id,
      email: user.email,
      userName: user.userName,
    };

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in DB (invalidate previous ones)
    await storeRefreshToken(user.id, refreshToken);

    // Cookie options - adapt for development vs production
    // Set HTTP-only cookie for refresh token
    // Cookie options - adapt for development vs production
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction, // secure cookies only over HTTPS in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    // Prepare user response without sensitive data
    const userResponse = {
      id: user._id,
      userName: user.userName,
      email: user.email,
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
      accessToken,
    });
  } catch (error) {
    next(new ErrorHandler(error));
  }
};

/**
 * @desc    Forgot password - send reset token
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email input
    if (!email) {
      return next(new ErrorHandler("Email is required", 400));
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(
        new ErrorHandler("Please provide a valid email address", 400)
      );
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists for security
      return res.status(200).json({
        success: true,
        message:
          "If your email exists in our system, you'll receive a password reset link shortly",
      });
    }

    // Generate reset token
    const resetToken = await generateResetPasswordToken(user._id);

    // Use dynamic frontend URL from environment variable
    const FRONTEND_BASE_URL =
      process.env.FRONTEND_BASE_URL || "http://localhost:5173";

    const resetUrl = `${FRONTEND_BASE_URL}/reset-password/${resetToken}`;

    try {
      // Send email
      await sendEmail({
        to: user.email,
        subject: "Your Password Reset Token (Valid for 15 minutes)",
        html: forgotPasswordTemplate(resetUrl),
        text: `Please reset your password by visiting this link: ${resetUrl}\n\nThis link expires in 15 minutes.`,
      });

      return res.status(200).json({
        success: true,
        message: "Password reset token sent to email",
      });
    } catch (emailError) {
      // Clean up the token if email fails
      await TokenModel.findOneAndDelete({ token: resetToken });

      console.error("Email sending failed:", emailError);
      return next(
        new ErrorHandler(
          "Failed to send password reset email. Please try again.",
          500
        )
      );
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    next(
      new ErrorHandler("An error occurred while processing your request", 500)
    );
  }
};

/**
 * @desc    Reset password
 * @route   PATCH /api/v1/auth/reset-password/:token
 * @access  Public
 */
const resetPasswordController = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log("password -", password);

    // Validate token presence
    if (!token) {
      return next(new ErrorHandler("Reset token is required", 400));
    }

    // Validate password
    if (!password || password.length < 8) {
      return next(
        new ErrorHandler("Password must be at least 8 characters long", 400)
      );
    }

    // Verify token validity
    let decoded;

    try {
      decoded = JWT.verify(token, process.env.RESET_PASSWORD_TOKEN_SECRET);
    } catch (jwtError) {
      await TokenModel.findOneAndDelete({ token });
      return next(
        new ErrorHandler(
          "Invalid or expired token. Please request a new reset link.",
          400
        )
      );
    }

    // Find valid token in database
    const tokenRecord = await TokenModel.findOne({
      token,
      type: "reset-password",
      expiresAt: { $gt: new Date() },
    });

    if (!tokenRecord) {
      return next(
        new ErrorHandler(
          "Invalid or expired token. Please request a new reset link.",
          400
        )
      );
    }

    // Find user
    const user = await userModel.findById(tokenRecord.userId);

    if (!user) {
      await TokenModel.findOneAndDelete({ token });
      return next(
        new ErrorHandler(
          "User not found. Please request a new reset link.",
          400
        )
      );
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return next(
        new ErrorHandler(
          "New password cannot be the same as current password",
          400
        )
      );
    }

    // Assign the plain password and let the user schema pre-save middleware
    // hash it once. This prevents double-hashing which would make the
    // password invalid when comparing during login.
    user.password = password;
    await user.save();

    // Clean up used token
    await TokenModel.findOneAndDelete({ token });

    // Send confirmation email
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Changed Successfully",
        html: `
          <div>
            <h2>Password Changed Successfully</h2>
            <p>Your password has been successfully changed.</p>
            <p>If you did not make this change, please contact support immediately.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Confirmation email failed:", emailError);
      // Don't fail the request if confirmation email fails
    }

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    next(
      new ErrorHandler("An error occurred while resetting your password", 500)
    );
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */

const getMeController = async (req, res, next) => {
  try {
    const user = await userModel.findById(req?.user.id).select("-password");

    if (!user) {
      return next(new ErrorHandler("User Not Found", 400));
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(new ErrorHandler(error));
  }
};

// logout controller
const logoutController = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    // Determine cookie options the same way we set them during login
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      path: "/",
    };

    if (token) {
      // Remove the refresh-token record (only for refresh-token type)
      await TokenModel.findOneAndDelete({ token, type: "refresh-token" });
    }

    // Clear cookie using matching options so the browser will remove it
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return next(new ErrorHandler("Internal server error", 500));
  }
};

module.exports = {
  signupController,
  loginController,
  verifyEmailController,
  getMeController,
  forgotPasswordController,
  resetPasswordController,
  logoutController,
};
