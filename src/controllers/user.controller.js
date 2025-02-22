import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// const generateAccessAndRefreshToken = async (userId) => {
//   try {
//     if (!userId) throw new ApiError(400, "User ID is required");

//     const user = await User.findById(userId);
//     if (!user) throw new ApiError(404, "User not found");

//     console.log("User fetched: ", user); // For debugging

//     const accessToken = user.generateAccessToken();
//     const refreshToken = user.generateRefreshToken();

//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });

//     return { accessToken, refreshToken };
//   } catch (error) {
//     console.error("Error generating tokens:", error); // Log the error for more details
//     throw new ApiError(
//       500,
//       "Something went wrong while generating refresh and access tokens"
//     );
//   }
// };
import jwt from "jsonwebtoken";

function generateAccessAndRefreshToken(userId) {
  const accessToken = jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET, // This should not be undefined
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_STRING, // Ensure this is not undefined
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d" }
  );

  return { accessToken, refreshToken };
}

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  let coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  console.log("Request Body:", req.body);

  if (!username && !email) {
    throw new ApiError(404, "User doesn't exist");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  console.log("User ID:", user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  // Debug password mismatch
  console.log("Entered Password:", password);
  console.log("Stored Hashed Password:", user.password);
  // const isPasswordValid = await bcrypt.compare(password, user.password);
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }
  console.log("User ID: ", user._id);
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
