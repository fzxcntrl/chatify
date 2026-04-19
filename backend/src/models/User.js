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
      minlength: 3,
      maxlength: 20,
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

    wallpaper: {
      type: String,
      default: "none",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
