import { v2 as cloudinery } from "cloudinary";
import { config } from "./config";

cloudinery.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
});

export default cloudinery;