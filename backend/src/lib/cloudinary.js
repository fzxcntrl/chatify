import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env.js";

if (ENV.CLOUDINARY_URL) {
  // If CLOUDINARY_URL is present in the environment, the SDK automatically picks it up, 
  // but we can explicitly configure it if needed, or simply let it be.
  // Actually, Cloudinary v2 automatically configures itself if process.env.CLOUDINARY_URL exists.
} else {
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
  });
}

export default cloudinary;
