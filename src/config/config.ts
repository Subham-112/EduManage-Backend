export const config = {
  mode: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,

  db: {
    url: process.env.MONGO_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  },

  cloudinary: {
    apiKey: process.env.CLOUDINARY_API_KEY,
    secret: process.env.CLOUDINARY_API_SECRET,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    url: process.env.CLOUDINARY_URL,
  },
};
