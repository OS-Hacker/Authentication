const express = require("express");
const {
  signupController,
  loginController,
  verifyEmailController,
  getMeController,
  forgotPasswordController,
  resetPasswordController,
  logoutController,
} = require("../controllers/user.controller");
const { body } = require("express-validator");
const { authenticate, verifyRefreshToken } = require("../middleware/verifyToken");
const userRouter = express.Router();

// User registration
userRouter.post(
  "/signup",
  [
    body("userName").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  signupController
);

// User login
userRouter.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  loginController
);

// User logout
userRouter.delete("/logout", logoutController);

// Varify Account By Email  Register -> send link to email ->
// Verify email via token
userRouter.get("/verify-email/:token", verifyEmailController);

// Password reset request
userRouter.post("/forgot-password", forgotPasswordController);
// Password reset using token
userRouter.post("/reset-password/:token", resetPasswordController);

// Get current user profile (protected route)  - access token verify here
userRouter.get("/me", authenticate, getMeController);

// refresh token
userRouter.post("/refresh-token", verifyRefreshToken);

module.exports = userRouter;
