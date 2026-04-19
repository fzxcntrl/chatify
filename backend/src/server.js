import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();

app.use(express.json({ limit: "5mb" }));
app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Vercel handles the frontend in production, so we only handle API routes here.
app.get("/", (_, res) => {
  res.status(200).send("Chatify API is running");
});

const start = async () => {
  await connectDB();
  server.listen(ENV.PORT, () => {
    console.log(`🚀 Chatify server running on port ${ENV.PORT} (${ENV.NODE_ENV})`);
  });
};

start();
