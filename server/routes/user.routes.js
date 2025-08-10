const express = require("express");
const { signupController, loginController } = require("../controllers/user.controller");

const userRouter = express.Router();

userRouter.post("/signup", signupController);

userRouter.post("/login", loginController);

module.exports = userRouter;
