const express = require("express");
const connectDB = require("./db/connectDB");
const cors = require("cors");
const userRouter = require("./routes/user.routes");
const { globalErrorHandler } = require("./middleware/globalErrorHandler");
require("dotenv").config();

const app = express();

// middlewere
app.use(
  cors({
    origin: "http://localhost:5173", // Your Vite frontend URL
    credentials: true, // If using cookies/auth
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// it use to parses JSON data sent by the client
app.use(express.json());
// this middleware is use to parses form data
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// db connection
connectDB();

// routes
app.use("/api/v1/", userRouter);

// global error handler
app.use(globalErrorHandler)

// create server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`server is running on ${PORT}`));
