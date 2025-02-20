import mongoose from "mongoose";
const DB_NAME = "videotube2";
// import { DB_NAME } from "../constants";
const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MONGODB connected !! DB HOST:${connection.connection.host}`
    );
  } catch (error) {
    console.error(`MONGODB connection error`, error);
    process.exit(1);
  }
};
export default connectDB;
