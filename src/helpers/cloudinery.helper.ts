import cloudinery from "../config/cloudinery";
import fs from "fs";
import path from "path";

interface CloudinaryUploadResult {
  url: string;
  public_id: string;
}

export const uploadToCloudinary = async (
  files: Express.Multer.File[],
  folder: string,
): Promise<CloudinaryUploadResult[]> => {
  if (!files || files.length === 0) {
    throw new Error("No files provided for upload");
  }

  const uploadResults: CloudinaryUploadResult[] = [];

  for (const file of files) {
    try {
      const filePath = path.resolve(file.path);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
      }

      const result = await cloudinery.uploader.upload(filePath, {
        folder,
        use_filename: true,
        unique_filename: false,
      });

      uploadResults.push({
        url: result.secure_url,
        public_id: result.public_id,
      });

      // Delete the local file after successful upload
      fs.unlinkSync(filePath);
    } catch (error) {
      // Extract error message from any error type
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === "object") {
        errorMessage = JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
      
      throw new Error(`Upload failed for ${file.originalname}: ${errorMessage}`);
    }
  }

  return uploadResults;
};
