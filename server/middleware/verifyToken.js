const jwt = require("jsonwebtoken");
const TokenModel = require("../models/Token.model");
const userModel = require("../models/user.model");
const { ErrorHandler } = require("../utils/ErrorHandler");
const { storeRefreshToken } = require("../utils/GenerateTokens");

// Verify Access Token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // Check if user exists and is verified
    const user = await userModel.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before accessing this resource",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ErrorHandler(error));

    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// Verify Refresh Token
const verifyRefreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return next(new ErrorHandler("Refresh token required", 400));
    }

    const storedToken = await TokenModel.findOne({ token });
    if (!storedToken) {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      return next(new ErrorHandler("Invalid refresh token", 400));
    }

    jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          res.clearCookie("refreshToken");
          res.clearCookie("accessToken");

          if (err.name === "TokenExpiredError") {
            await TokenModel.deleteOne({ token });
            return next(new ErrorHandler("Refresh token expired", 401));
          }

          return next(new ErrorHandler("Invalid refresh token", 401));
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken({
          id: decoded?.id,
          email: decoded?.email,
        });

        const newRefreshToken = generateRefreshToken({
          id: decoded.id,
          email: decoded.email,
        });

        // Update refresh token in database
        // Invalidate previous token and store new one
        await storeRefreshToken(storedToken.userId, newRefreshToken);

        // Set HTTP-only cookie for refresh token
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
          success: true,
          message: "Tokens refreshed successfully",
          accessToken: newAccessToken,
        });
      }
    );
  } catch (error) {
    console.error("Refresh token error:", error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to access this resource",
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  verifyRefreshToken,
  authorize,
};
