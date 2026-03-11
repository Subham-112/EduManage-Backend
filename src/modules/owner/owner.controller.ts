import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiError from "../../utils/ApiError";
import mongoose from "mongoose";
import { OwnerService } from "./owner.service";
import { OwnerStatus } from "../../config/enums";

export const createOwner = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, password, tenant, branch } = req.body;

  if (!name || typeof name !== "string") {
    throw new ApiError(400, "Invalid name");
  }
  if (!phone || typeof phone !== "string") {
    throw new ApiError(400, "Invalid phone");
  } else if (!/^\d{10}$/.test(phone)) {
    throw new ApiError(400, "Phone number must be 10 digits");
  }
  if (!password || password.trim().length < 6) {
    throw new ApiError(
      400,
      "Invalid password or password must be at least 6 characters",
    );
  }
  if (!tenant || !mongoose.Types.ObjectId.isValid(tenant)) {
    throw new ApiError(400, "Invalid tenant or tenant must be an ObjectId");
  }
  if (!branch || !mongoose.Types.ObjectId.isValid(branch)) {
    throw new ApiError(400, "Invalid branch or branch must be an ObjectId");
  }

  const response = await OwnerService.createOwner({
    name,
    phone: phone,
    email: req.body.email || "",
    password,
    tenant,
    branch,
    status: OwnerStatus.ACTIVE,
    file: req.file,
  });

  return res.status(response.statusCode).json(response);
});

export const loginOwner = asyncHandler(
  async (req: Request, res: Response) => {
    const { phone, password } = req.body;

    if (!phone || typeof phone !== "string") {
      throw new ApiError(400, "Invalid phone");
    }
    if (!/^\d{10}$/.test(phone)) {
      throw new ApiError(400, "Phone number must be 10 digits");
    }
    if (!password || password.trim().length < 6) {
      throw new ApiError(
        400,
        "Invalid password or password must be at least 6 characters",
      );
    }

    const response = await OwnerService.loginOwner(phone, password);

    return res.status(response.statusCode).json(response);
  },
)

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { phone, oldPassword, newPassword } = req.body;

    if (!phone || typeof phone !== "string") {
      throw new ApiError(400, "Invalid phone");
    }
    if (!/^\d{10}$/.test(phone)) {
      throw new ApiError(400, "Phone number must be 10 digits");
    }
    if (!oldPassword || oldPassword.trim().length < 6) {
      throw new ApiError(
        400,
        "Invalid old password or old password must be at least 6 characters",
      );
    }
    if (!newPassword || newPassword.trim().length < 6) {
      throw new ApiError(
        400,
        "Invalid new password or new password must be at least 6 characters",
      );
    }
    if (oldPassword === newPassword) {
      throw new ApiError(400, "New password must be different from old password");
    }

    const response = await OwnerService.changePassword(phone, oldPassword, newPassword);

    return res.status(response.statusCode).json(response);
  }
);

export const getAllOwners = asyncHandler(
  async (req: Request, res: Response) => {
    const response = await OwnerService.getAllOwners();
    return res.status(response.statusCode).json(response);
  },
);

export const getOwnerById = asyncHandler(
  async (req: Request, res: Response) => {
    const { ownerId } = req.params;
    if (!ownerId || !mongoose.Types.ObjectId.isValid(String(ownerId))) {
      throw new ApiError(400, "Owner Id is required or Invalid Owner Id");
    }

    const response = await OwnerService.getOwnerById(String(ownerId));
    return res.status(response.statusCode).json(response);
  }
);

export const getActiveOwners = asyncHandler(
  async (req: Request, res: Response) => {
    const response = await OwnerService.getActiveOwners();
    return res.status(response.statusCode).json(response);
  },
);

export const updateOwner = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.params.ownerId || !mongoose.Types.ObjectId.isValid(String(req.params.ownerId))) {
      throw new ApiError(400, "Owner id is required or Invalid Owner Id");
    }

    const payload = {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      file: req.file
    }

    const response = await OwnerService.updateOwner(String(req.params.ownerId), payload);
    return res.status(response.statusCode).json(response);
  }
);

export const deleteOwner = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.params.ownerId || !mongoose.Types.ObjectId.isValid(String(req.params.ownerId))) {
      throw new ApiError(400, "Owner id is required or Invalid Owner Id");
    }

    const response = await OwnerService.deleteOwner(String(req.params.ownerId));
    return res.status(response.statusCode).json(response);
  }
)
