const express = require("express");
const {
  signupController,
  loginController,
  verifyEmailController,
} = require("../controllers/user.controller");

const userRouter = express.Router();

userRouter.post("/signup", signupController);

userRouter.post("/login", loginController);

userRouter.get("/verify-email/:token", verifyEmailController);

module.exports = userRouter;
