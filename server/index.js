const express = require("express");
const connectDB = require("./db/connectDB");
const cors = require("cors");
const userRouter = require("./routes/user.routes");

const app = express();

// middlewere
app.use(cors());
app.use(express.json());

// db connection
connectDB();

// routes
app.use("/api/v1/", userRouter);

// create server
const port = 8080;
app.listen(port, () => console.log(`server is running on ${port}`));
