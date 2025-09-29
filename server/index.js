const express = require("express");
const connectDB = require("./db/connectDB");
const cors = require("cors");
const userRouter = require("./routes/user.routes");
require("dotenv").config();

const app = express();

// middlewere
app.use(cors());
// it use to parses JSON data sent by the client
app.use(express.json());
// this middleware is use to parses form data
app.use(express.urlencoded({ extended: false }));

// db connection
connectDB();

// routes
app.use("/api/v1/", userRouter);

// create server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`server is running on ${PORT}`));
