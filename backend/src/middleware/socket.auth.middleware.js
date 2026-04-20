import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

const getTokenFromSocket = (socket) => {
  const handshakeToken = socket.handshake.auth?.token;
  if (handshakeToken) return handshakeToken;

  return socket.handshake.headers.cookie
    ?.split("; ")
    .find((row) => row.startsWith("jwt="))
    ?.split("=")[1];
};

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = getTokenFromSocket(socket);

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return next(new Error("Unauthorized"));
      }
      return next(new Error("Unauthorized"));
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(new Error("Unauthorized"));
    }

    socket.user = user;
    socket.userId = user._id.toString();

    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
};
