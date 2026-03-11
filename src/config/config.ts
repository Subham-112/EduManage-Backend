import path from "path";
import dotenv from "dotenv";

dotenv.config({
    path: path.resolve(__dirname, "../../.env"),
});

const toBool = (value: string | undefined, fallback = false): boolean => {
    if (value == null) return fallback;
    const v = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(v)) return true;
    if (["false", "0", "no", "off"].includes(v)) return false;
    return fallback;
};

export const config = {
    env: process.env.NODE_ENV,
    port: Number(process.env.PORT),

    cors: {
        enable: toBool(process.env.CORS_ENABLED),
        allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || []
    },

    db: {
        name: process.env.DB_NAME,
        url: process.env.MONGO_URL,
        isSrv: toBool(process.env.IS_MONGO_SRV_URL)
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    },

    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        cloudinaryUrl: process.env.CLOUDINARY_URL
    }
}