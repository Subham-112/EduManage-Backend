import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import path from "path";
import cloudinaryInstance from "../config/cloudinary";
import { Request } from "express";

const storage = (folderName: string) => {
  return new CloudinaryStorage({
    cloudinary: cloudinaryInstance,
    params: async (req: Request, file: Express.Multer.File) => {
      const originalName = path.parse(file.originalname).name;

      const customName = req.body.imageName || `${originalName}-${Date.now()}`;

      return {
        folder: folderName,
        public_id: customName,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        resource_type: "image",
      };
    },
  });
};

export const upload = (folderName: string) => {
    return multer({
        storage: storage(folderName),
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
            const allowed = ["image/jpeg", "image/png", "image/webp"];
            const extname = allowed.includes(path.extname(file.originalname).toLowerCase());
            const mimetype = allowed.includes(file.mimetype);

            if (extname && mimetype) {
                return cb(null, true);
            } else {
                return cb(new Error("Only .jpg, .jpeg, .png, and .webp formats are allowed"));
            }
        },
    });
};
