const userModel = require("../models/user.model");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../util/SendEmail");
const forgotPasswordTemplate = require("../templates/ForgotPasswordTemplate");

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */
const signupController = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;

    // Validate password strength
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists. Please login instead.",
      });
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in ms

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
      message: "Registration successful",
      user: userResponse,
    });
  } catch (error) {
    console.log("Signup error:", error);
    return res.status(500).json({
      success: false,
      message:
        "An unexpected error occurred during registration. Please try again.",
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

    console.log(email, password);

    // Find user by email (including password for comparison)
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
    const token = JWT.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
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

const verifyUserAccountController = async (req, res) => {
  const { email } = req.body;

  // Create verification URL
  const verificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/verify-email/${emailVerificationToken}`;

  if (!email) {
    return res.status(401).json({
      success: false,
      message: "email is required",
    });
  }

  // Validate email before sending
  if (!email.includes("@") || !verificationUrl.startsWith("http")) {
    return res.status(401).json({
      success: false,
      message: "Invalid recipient email address",
    });
  }

  try {
    // Enhanced email sending with timeout
    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      html: verifyAccountTemplate(email, verificationUrl),
      text: `Please verify your email by visiting this link: ${verificationUrl}\n\nEmail: ${email}\nPassword: The password you entered during signup\n\nThis link expires in 24 hours.`,
    });

    return res.status(200).json({
      success: true,
      message: `Verification email sent to ${email}`,
    });
  } catch (emailError) {
    console.log("Failed to send verification email:", emailError);
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
    const authToken = JWT.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
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
 * @desc    Forgot password - send reset token
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists for security
      return res.status(200).json({
        success: true,
        message: "If your email exists, you'll receive a password reset link",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const PASSWORD_RESET_EXPIRY = 15 * 60 * 1000; // 15 min

    // Set token expiry (15 minutes from now)
    const passwordResetExpires = Date.now() + PASSWORD_RESET_EXPIRY;

    // Save token to database
    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    // Create reset URL
    // const resetUrl = `${req.protocol}://${req.get(
    //   "host"
    // )}/reset-password/${resetToken}`;

    // Use frontend URL instead of backend URL
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

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
      // Clear the reset token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      console.error("Failed to send password reset email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
};

/**
 * @desc    Reset password
 * @route   PATCH /api/v1/auth/reset-password/:token
 * @access  Public
 */
const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Hash the incoming token to compare with database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token that hasn't expired
    const user = await userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token. Please request a new reset link.",
      });
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: "Password Changed Successfully",
      html: `<p>Your password has been successfully changed.</p>`,
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while resetting your password",
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
  verifyUserAccountController,
  forgotPasswordController,
  resetPasswordController,
};
