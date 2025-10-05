export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });

  // Log the error for debugging
  console.error(err);
  
  // Handle specific JWT errors
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Access token expired",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid access token",
    });
  }

  if (err.name === "TokenExpiredError")
    return res.status(401).json({
      success: false,
      message: "Access token expired",
    });

  res.status(500).json({
    success: false,
    message: "Authentication failed",
  });
  // Pass to next middleware if not handled
  next();
};

export const notFoundError = (err, req, res, next) => {
  let error = new Error(
    `cannot find the route for ${req.originalUrl} at the server`
  );
  error.statusCode = 404;
  next(error);
};
