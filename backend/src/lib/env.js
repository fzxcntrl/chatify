import "dotenv/config";

const normalizeOrigin = (value) => value?.trim().replace(/\/+$/, "");
const parseOrigins = (value) =>
  (value || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

const REQUIRED_VARS = [
  "MONGO_URI",
  "JWT_SECRET",
];

const RECOMMENDED_VARS = [
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
  "ARCJET_KEY",
];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  process.exit(1);
}

const hasCloudinaryUrl = !!process.env.CLOUDINARY_URL;
const hasCloudinaryKeys = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (!hasCloudinaryUrl && !hasCloudinaryKeys) {
  console.error("\n⛔  Missing Cloudinary configuration in .env");
  console.error("   Please provide either CLOUDINARY_URL OR the individual CLOUD_NAME, API_KEY, and API_SECRET.");
  process.exit(1);
}

export const ENV = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: null,
  ALLOWED_ORIGINS: [],
  GMAIL_USER: process.env.GMAIL_USER,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || "Chatify",
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  ARCJET_KEY: process.env.ARCJET_KEY,
  ARCJET_ENV: process.env.ARCJET_ENV || "development",
};

const configuredOrigins = parseOrigins(process.env.CLIENT_URL);
const localDevOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

ENV.ALLOWED_ORIGINS = [
  ...new Set([
    ...(configuredOrigins.length ? configuredOrigins : localDevOrigins),
    ...(ENV.NODE_ENV === "development" ? localDevOrigins : []),
  ]),
];

ENV.CLIENT_URL = ENV.ALLOWED_ORIGINS[0] || "http://localhost:5173";
