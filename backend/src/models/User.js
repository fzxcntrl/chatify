import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 150,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    theme: {
      type: String,
      enum: ["dark", "light"],
      default: "dark",
    },
    chatTheme: {
      type: String,
      default: "default",
    },
    chatBg: {
      type: String,
      default: "default",
    },
    locationMarker: {
      type: String,
      default: "classic_pin",
      enum: [
        "classic_pin",
        "compass",
        "target",
        "lightning",
        "flame",
        "star",
        "ghost",
        "skeleton",
        "ufo",
        "butterfly",
        "diamond",
      ],
    },

    wallpaper: {
      type: String,
      default: "none",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
