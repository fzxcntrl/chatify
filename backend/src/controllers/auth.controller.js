import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { clearTokenCookie, generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password, username } = req.body;

  try {
    if (!fullName || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Instagram-style username: lowercase, numbers, underscores, dots only
    // 3-30 chars, no consecutive dots, can't start/end with dot
    const sanitizedUsername = username.toLowerCase();
    const usernameRegex = /^(?!.*\.\.)(?!\.)(?!.*\.$)[a-z0-9_.]{3,30}$/;
    if (!usernameRegex.test(sanitizedUsername)) {
      return res.status(400).json({ message: "Username must be 3-30 characters. Only lowercase letters, numbers, underscores and periods allowed." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUsername = await User.findOne({ username: sanitizedUsername });
    if (existingUsername) return res.status(400).json({ message: "Username already taken" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      username: sanitizedUsername,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    const token = generateToken(savedUser._id, res);

    res.status(201).json({
      _id: savedUser._id,
      fullName: savedUser.fullName,
      username: savedUser.username,
      email: savedUser.email,
      profilePic: savedUser.profilePic,
      bio: savedUser.bio,
      theme: savedUser.theme,
      chatTheme: savedUser.chatTheme,
      chatBg: savedUser.chatBg,
      locationMarker: savedUser.locationMarker,
      token,
    });

    // Send welcome email (don't block the response)
    sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL)
      .catch((err) => console.error("❌ Failed to send welcome email:", err.message || err));
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      theme: user.theme,
      chatTheme: user.chatTheme,
      chatBg: user.chatBg,
      locationMarker: user.locationMarker,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (_, res) => {
  clearTokenCookie(res);
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, username, bio, theme, chatTheme, chatBg, locationMarker } = req.body;
    const userId = req.user._id;
    let updateData = {};
    const hasProfilePicField = Object.prototype.hasOwnProperty.call(req.body, "profilePic");
    const allowedLocationMarkers = new Set([
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
    ]);

    if (hasProfilePicField) {
      if (profilePic) {
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
          folder: "chatify_avatars",
          resource_type: "image",
          transformation: [{ width: 400, height: 400, crop: "fill", quality: "auto" }],
        });
        updateData.profilePic = uploadResponse.secure_url;
      } else {
        updateData.profilePic = "";
      }
    }

    if (username) {
      const sanitized = username.toLowerCase();
      const usernameRegex = /^(?!.*\.\.)(?!\.)(?!.*\.$)[a-z0-9_.]{3,30}$/;
      if (!usernameRegex.test(sanitized)) {
        return res.status(400).json({ message: "Username must be 3-30 characters. Only lowercase letters, numbers, underscores and periods allowed." });
      }

      const existingUser = await User.findOne({ 
        username: sanitized,
        _id: { $ne: userId }
      });
      
      if (existingUser) return res.status(400).json({ message: "Username already taken" });
      updateData.username = sanitized;
    }

    if (bio !== undefined) {
      updateData.bio = bio.slice(0, 150);
    }

    if (theme && ["dark", "light"].includes(theme)) {
      updateData.theme = theme;
    }

    if (chatTheme !== undefined) {
      updateData.chatTheme = chatTheme;
    }

    if (chatBg !== undefined) {
      updateData.chatBg = chatBg;
    }

    if (locationMarker !== undefined) {
      if (!allowedLocationMarkers.has(locationMarker)) {
        return res.status(400).json({ message: "Invalid location marker selected" });
      }
      updateData.locationMarker = locationMarker;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
