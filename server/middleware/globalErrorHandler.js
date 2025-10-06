function globalErrorHandler(err, req, res, next) {
  // Avoid attempting to send multiple responses
  if (res.headersSent) {
    return next(err);
  }

  // Log the full error object for debugging
  console.error(err);

  // Handle known JWT errors explicitly
  if (err && err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json({ success: false, message: "Access token expired" });
  }

  if (err && err.name === "JsonWebTokenError") {
    return res
      .status(401)
      .json({ success: false, message: "Invalid access token" });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({ success: false, message });
}

function notFoundError(req, res, next) {
  const error = new Error(`Cannot find route ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

module.exports = { globalErrorHandler, notFoundError };
