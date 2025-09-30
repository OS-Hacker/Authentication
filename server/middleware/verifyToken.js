const jwt = require("jsonwebtoken");

// Verify access token middleware
async function authToken(req, res, next) {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

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

      req.userId = decoded?._id;
      req.user = decoded;
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

// Verify refresh token middleware
async function verifyRefreshToken(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token required",
        error: true,
        success: false,
      });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(401).json({
            message: "Invalid refresh token",
            error: true,
            success: false,
          });
        }

        req.userId = decoded?._id;
        req.user = decoded;
        next();
      }
    );
  } catch (err) {
    res.status(500).json({
      message: err.message || err,
      data: [],
      error: true,
      success: false,
    });
  }
}

// Set tokens in cookies
function setTokenCookies(res, accessToken, refreshToken) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Clear tokens from cookies
function clearTokenCookies(res) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
}

module.exports = {
  authToken,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
};
