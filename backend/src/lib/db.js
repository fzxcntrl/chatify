import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    
    // Auto-migration: Give legacy users a generated username to satisfy the unique required constraint
    const User = (await import("../models/User.js")).default;
    const usersWithoutUsername = await User.find({ username: { $exists: false } });
    if (usersWithoutUsername.length > 0) {
      console.log(`Migrating ${usersWithoutUsername.length} legacy users with new usernames...`);
      for (const user of usersWithoutUsername) {
        const baseName = user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 10);
        const randomStr = Math.floor(Math.random() * 99999);
        user.username = `${baseName}_${randomStr}`.toLowerCase();
        await user.save({ validateModifiedOnly: true });
      }
      console.log("✅ Legacy user migration complete.");
    }
  } catch (error) {
    console.error("⛔ MongoDB connection error:", error.message);
    process.exit(1);
  }
};
