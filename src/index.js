// require("dotenv").config();
import dotenv from "dotenv";
import express from "express";
const app = express();

// import mongoose from "mongoose ";
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";
dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`server is running on  http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection Failed", error);
  });

// Test Route
app.get("/", (req, res) => {
  console.log("Root route accessed");
  res.send("Server is working!");
});
//routes import
import userRouter from "./routes/user.routes.js";
// Middleware
app.use(express.json()); // Necessary for parsing JSON requests
//routes declaration

app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/users", userRouter);
export { app };
