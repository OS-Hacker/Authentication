const jwt = require("jsonwebtoken");
const refreshTokenModel = require("../models/refreshToken.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/GenerateTokens");
const { ErrorHandler } = require("../utils/ErrorHandler");

// Verify access token middleware
async function authToken(req, res, next) {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    console.log(accessToken);

    if (!accessToken) {
      return res.status(401).json({
        message: "Access token required",
        error: true,
        success: false,
      });
    }

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            message: "Access token expired",
            error: true,
            success: false,
            code: "TOKEN_EXPIRED",
          });
        }

        return res.status(401).json({
          message: "Invalid access token",
          error: true,
          success: false,
        });
      }
      req.user = {
        id: decoded.id,
        email: decoded.email,
      };

      console.log(req.user);
      next();
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || err,
      data: [],
      error: true,
      success: false,
    });
  }
}

module.exports = authToken;
