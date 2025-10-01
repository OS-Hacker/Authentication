const userModel = require("../models/user.model");
const { validationResult } = require("express-validator");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/SendEmail");
const forgotPasswordTemplate = require("../templates/ForgotPasswordTemplate");
const { ErrorHandler } = require("../utils/ErrorHandler");
const refreshTokenModel = require("../models/refreshToken.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/GenerateTokens");

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

    const EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in ms

    // Create email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationTokenExpires =
      Date.now() + EMAIL_VERIFICATION_EXPIRY;

    // Create new user
    const newUser = new userModel({
      userName,
      email,
      password, // Will be hashed by pre-save middleware
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
    next(new ErrorHandler(error));
  }
};

const verifyUserAccountController = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("email is required", 400));
  }

  // Validate email format
  if (!email.includes("@")) {
    return next(new ErrorHandler("Invalid recipient email address", 400));
  }

  try {
    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Generate new verification token if not present or expired
    let emailVerificationToken = user.emailVerificationToken;
    if (
      !emailVerificationToken ||
      user.emailVerificationTokenExpires < Date.now()
    ) {
      emailVerificationToken = crypto.randomBytes(32).toString("hex");
      user.emailVerificationToken = emailVerificationToken;
      user.emailVerificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      await user.save();
    }

    // Create verification URL
    const verificationUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/verify-email/${emailVerificationToken}`;

    // Send verification email
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
    return next(new ErrorHandler("Failed to send verification email", 500));
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
      return next(
        new ErrorHandler("Invalid or expired verification token", 400)
      );
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

    console.log("user -", user);

    if (!user) {
      return next(new ErrorHandler("Invalid credentials", 400));
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

    console.log("tokenPayload -", tokenPayload);

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in DB
    await refreshTokenModel.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Set secure HTTP-only cookie for access token
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set secure HTTP-only cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
      return next(new ErrorHandler("email is required", 400));
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists for security
      return next(
        new ErrorHandler(
          "If your email exists, you'll receive a password reset link",
          400
        )
      );
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
      // Clear the reset token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return next(new ErrorHandler("Failed to send password reset email", 400));
    }
  } catch (error) {
    next(new ErrorHandler(error));
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

    // Validate password
    if (!password || password.length < 8) {
      return next(
        new ErrorHandler("Password must be at least 8 characters long", 400)
      );
    }

    // Hash the incoming token to compare with database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token that hasn't expired
    const user = await userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorHandler(
          "Invalid or expired token. Please request a new reset link.",
          400
        )
      );
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
    next(new ErrorHandler(error));
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

// when user access token expire
const refreshTokenController = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    console.log(token);

    if (!token) {
      return next(new ErrorHandler("Refresh token required", 400));
    }

    const storedToken = await refreshTokenModel.findOne({ token });
    if (!storedToken) {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      return next(new ErrorHandler("Invalid refresh token", 400));
    }

    JWT.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          res.clearCookie("refreshToken");
          res.clearCookie("accessToken");

          if (err.name === "TokenExpiredError") {
            await refreshTokenModel.deleteOne({ token });
            return next(new ErrorHandler("Refresh token expired", 401));
          }

          return next(new ErrorHandler("Invalid refresh token", 401));
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken({
          _id: decoded._id || decoded.id,
          email: decoded.email,
        });

        const newRefreshToken = generateRefreshToken({
          _id: decoded._id || decoded.id,
          email: decoded.email,
        });

        // Update refresh token in database
        await refreshTokenModel.findOneAndUpdate(
          { token },
          {
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          }
        );

        // Set new tokens in cookies
        const cookieOptions = {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        };

        // Add secure flag in production
        // if (process.env.NODE_ENV === "production") {
        //   cookieOptions.secure = true;
        // }

        res.cookie("refreshToken", newRefreshToken, cookieOptions);
        res.cookie("accessToken", newAccessToken, cookieOptions);

        res.status(200).json({
          success: true,
          message: "Tokens refreshed successfully",
          // Optionally return the new access token in response body too
          // accessToken: newAccessToken,
        });
      }
    );
  } catch (error) {
    console.error("Refresh token error:", error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

const logoutController = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      // Remove token from database
      await refreshTokenModel.deleteOne({ token });
    }

    // Clear cookies
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
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
  verifyUserAccountController,
  forgotPasswordController,
  resetPasswordController,
  refreshTokenController,
  logoutController,
};
