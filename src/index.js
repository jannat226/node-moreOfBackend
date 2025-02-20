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
      console.log("server is running");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection Failed", error);
  });

// import express from "express";
// const app = express()(
//   // ify-> call the function immediately ||semi-colon is used just for the cleaning purposes

//   // whenever use the datbase always use try-catch or promises

// async () => {
//     try {
//       mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//       app.on("error", (error) => {
//         console.error("ERR:", error);
//         throw error;
//       });

//       app.listen(process.env.PORT, () => {
//         console.log(`app listening on port,${process.env.PORT}`);
//       });
//     } catch (error) {
//       console.error("Error:", error);
//       throw error;
//     }
//   }
// )();
