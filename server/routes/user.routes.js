const express = require("express");
const {
  signupController,
  loginController,
  verifyEmailController,
  getMeController,
  verifyUserAccountController,
  forgotPasswordController,
  resetPasswordController,
} = require("../controllers/user.controller");

const userRouter = express.Router();

userRouter.post("/signup", signupController);

userRouter.post("/login", loginController);

// verify account
userRouter.get("/verify-email/:token", verifyEmailController);
userRouter.post("/verify-email", verifyUserAccountController);

// get Me , if I loginned
userRouter.get("/me", getMeController);

// reset password
userRouter.post("/forgot-password", forgotPasswordController);
userRouter.post("/reset-password/:token", resetPasswordController);

module.exports = userRouter;
