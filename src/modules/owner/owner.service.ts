import { OwnerStatus } from "../../config/enums";
import { UserRole } from "../../middlewares/auth.middleware";
import Owner from "../../models/owner.model";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import { generateAccessToken } from "../../utils/token";
import { uploadToCloudinary } from "../../helpers/cloudinery.helper";
import { logger } from "../../utils/logger.util";
import { comparePasswords, hashPassword } from "../../utils/password.util";

interface ICreateOwnerPayload {
  name: string;
  phone: string;
  email?: string;
  password: string;
  tenant: string;
  branch: string;
  status: OwnerStatus;
  file?: Express.Multer.File;
}

interface IUpdateOwnerPayload {
  name: string;
  phone: string;
  email?: string;
  file?: Express.Multer.File;
}

export const findOwner = (query: any) => {
  return Owner.findOne(query);
};

export const findOwnerLean = (query: any) => {
  return Owner.findOne(query).lean();
};

export const OwnerService = {
  async createOwner(payload: ICreateOwnerPayload) {
    const isOwnerExist = await findOwnerLean(
      payload.phone ? { 
        phone: payload.phone
      } : {
        email: payload.email
      });

    if (isOwnerExist) {
      throw new ApiError(400, "Owner already exists");
    }

    const hashedPass = await hashPassword(payload.password);

    // Prepare owner data without avatar
    const ownerData: any = {
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      password: hashedPass,
      tenant: payload.tenant,
      branch: payload.branch,
      status: OwnerStatus.ACTIVE,
    };

    // Create owner in database without avatar
    const newOwner = await Owner.create(ownerData);

    const tokenPayload = {
      user: {
        id: String(newOwner._id),
        phone: newOwner.phone,
        role: UserRole.OWNER,
        tenantId: newOwner.tenant,
        branchId: newOwner.branch,
      },
    };

    const AccessToken = await generateAccessToken(tokenPayload);

    const result = { accessToken: AccessToken, ...newOwner.toObject() };

    // Start async avatar upload operation without awaiting
    if (payload.file) {
      logger.info(`Starting avatar upload for owner: ${newOwner._id}`);
      handleAvatarUpload(
        newOwner._id.toString(),
        payload.file,
        `tenant_${payload.tenant}/owner/avatar`,
      );
    }

    return new ApiResponse(200, result, "Owner created successfully");
  },

  async loginOwner(phone: string, password: string) {
    const owner = await findOwnerLean({phone: phone});
    console.log(owner);
    if (!owner) {
      throw new ApiError(404, "Owner not found");
    }

    const isPasswordValid = await comparePasswords(password, owner.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const tokenPayload = {
      user: {
        id: String(owner._id),
        phone: owner.phone,
        role: UserRole.OWNER,
        tenantId: owner.tenant,
        branchId: owner.branch,
      },
    };

    const AccessToken = await generateAccessToken(tokenPayload);

    const result = { accessToken: AccessToken, ...owner };

    return new ApiResponse(200, result, "Owner logged in successfully");
  },

  async changePassword(phone: string, oldPassword: string, newPassword: string) {
    const owner = await findOwner({phone: phone});
    console.log(owner);
    if (!owner) {
      throw new ApiError(404, "Owner not found");
    }

    const isOldPasswordValid = await comparePasswords(oldPassword, owner.password);
    if (!isOldPasswordValid) {
      throw new ApiError(401, "Invalid old password");
    }

    const newHashPassword = await hashPassword(newPassword);

    owner.password = newHashPassword;
    await owner.save();

    return new ApiResponse(200, owner, "Password changed successfully");
  },

  async getAllOwners() {
    const owners = await Owner.find()
      .populate("tenant", "_id name tenantPhone status")
      .populate("branch")
      .lean();
    if (!owners || owners.length === 0) {
      throw new ApiError(404, "Owners not found")
    }

    return new ApiResponse(201, owners, "Owners fetch successfully");
  },

  async getOwnerById(ownerId: string) {
    const owner = await Owner.findById(ownerId)
      .populate("tenant", "_id name tenantPhone status")
      .populate("branch")
      .lean();
  
    if (!owner) {
      throw new ApiError(404, "Owner not found");
    }

    return new ApiResponse(200, owner, "Owner fetched successfully");
  },

  async getActiveOwners() {
    const owners = await Owner.find({ status: OwnerStatus.ACTIVE })
      .populate("tenant", "_id name tenantPhone status")
      .populate("branch")
      .lean();
    if (!owners || owners.length === 0) {
      throw new ApiError(404, "Owners not found")
    }

    return new ApiResponse(201, owners, "Active Owners fetch successfully");
  },

  async updateOwner(ownerId: string, payload: IUpdateOwnerPayload) {
    const owner = await Owner.findById(ownerId).select("_id").lean();
    if (!owner) {
      throw new ApiError(404, "Owner not found");
    }

    // Update other fields
    owner.name = payload.name;
    owner.phone = payload.phone;
    owner.email = payload.email;
    
    const updatedOwner = await Owner.findByIdAndUpdate(
      ownerId,
      {$set: {
        name: payload.name,
        phone: payload.phone,
        email: payload.email
      }}, { new: true }
    )
    
    // Start async avatar upload operation without awaiting
    if (payload.file) {
      logger.info(`Starting avatar upload for owner: ${ownerId}`);
      handleAvatarUpload(
        ownerId,
        payload.file,
        `tenant_${ownerId}/owner/avatar`,
      );
    }

    return new ApiResponse(200, updatedOwner, "Owner updated successfully");
  },

  async deleteOwner(ownerId: string) {
    const owner = await Owner.findByIdAndDelete(ownerId);
    return new ApiResponse(200, owner, "Owner account deleted successfully")
  }
};

// Background function to handle avatar upload and update owner document
async function handleAvatarUpload(
  ownerId: string,
  file: Express.Multer.File,
  folderPath: string,
) {
  try {
    const uploadResults = await uploadToCloudinary([file], folderPath);

    if (uploadResults.length > 0) {
      const uploadResult = uploadResults[0];

      const avatarData = {
        url: uploadResult.url,
        key: uploadResult.public_id,
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      };

      // Update owner document with avatar data
      await Owner.findByIdAndUpdate(ownerId, { avatar: avatarData });

      logger.info(`Avatar uploaded successfully for owner: ${ownerId}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Avatar upload failed for owner ${ownerId}: ${errorMessage}`);
  }
}
