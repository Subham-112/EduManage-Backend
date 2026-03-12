import { uploadToCloudinary } from "../helpers/cloudinery.helper";
import Owner from "../models/owner.model";
import Student from "../modules/student/student.model";
import { logger } from "./logger.util";
import { Model } from "mongoose";

// Global function to handle image upload and update document field
export async function handleAvatarUpload(
  docId: string,
  file: Express.Multer.File,
  folderPath: string,
  modelType: "owner" | "student",
  field: string = "avatar"
) {
  try {
    const uploadResults = await uploadToCloudinary([file], folderPath);
    if (uploadResults.length > 0) {
      const uploadResult = uploadResults[0];
      const imageData = {
        url: uploadResult.url,
        key: uploadResult.public_id,
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      };
      let model: Model<any>;
      if (modelType === "owner") {
        model = Owner as Model<any>;
      } else if (modelType === "student") {
        model = Student as Model<any>;
      } else {
        throw new Error("Invalid model type for avatar upload");
      }
      await model.findByIdAndUpdate(
        docId,
        { [field]: imageData },
        { returnDocument: "after" }
      );
      logger.info(`Image uploaded successfully for ${modelType}: ${docId}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Image upload failed for ${docId}: ${errorMessage}`);
  }
}
