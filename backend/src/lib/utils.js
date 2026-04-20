import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const getAuthCookieOptions = () => ({
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: ENV.NODE_ENV === "development" ? "strict" : "none",
  secure: ENV.NODE_ENV !== "development",
  path: "/",
});

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, getAuthCookieOptions());

  return token;
};

export const clearTokenCookie = (res) => {
  res.cookie("jwt", "", {
    ...getAuthCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });
};
