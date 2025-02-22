import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detect file type (image, video, etc.)
    });

    console.log("File is uploaded on cloudinary");
    return response;
  } catch (error) {
    console.error("Upload failed:", error);
    console.error("Cloudinary Upload Error: ", error.message);

    // Attempt to delete the local file if upload fails
    if (localFilePath) {
      try {
        fs.unlinkSync(localFilePath);
        console.log("Local file removed successfully");
      } catch (unlinkError) {
        console.error("Failed to delete local file:", unlinkError);
      }
    }
    throw new Error("File upload failed");
  }
};

export { uploadOnCloudinary };
