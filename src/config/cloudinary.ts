import { v2 as cloudinaryInstance } from "cloudinary";
import { config } from "./config";

const cloudName = config.cloudinary.cloudName;
const apiKey = config.cloudinary.apiKey;
const secret = config.cloudinary.secret;

cloudinaryInstance.config({
  secure: true,
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: secret,
});

export default cloudinaryInstance;
