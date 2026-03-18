import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiError from "../../utils/ApiError";
import mongoose from "mongoose";
import { TeacherService } from "./teacher.service";
import { TeacherStatus } from "../../config/enums";

export const createTeacher = asyncHandler(async (req: Request, res: Response) => {
  const { name, teacherPhone, password, tenant, branch, address, qualification, subjects } = req.body;

  if (!name || typeof name !== "string") {
    throw new ApiError(400, "Invalid name");
  }
  if (!teacherPhone || typeof teacherPhone !== "string") {
    throw new ApiError(400, "Invalid phone");
  } else if (!/^\d{10}$/.test(teacherPhone)) {
    throw new ApiError(400, "Phone number must be 10 digits");
  }
  if (!password || password.trim().length < 6) {
    throw new ApiError(400, "Invalid password or password must be at least 6 characters");
  }
  if (!tenant || !mongoose.Types.ObjectId.isValid(tenant)) {
    throw new ApiError(400, "Invalid tenant or tenant must be an ObjectId");
  }
  if (!branch || !mongoose.Types.ObjectId.isValid(branch)) {
    throw new ApiError(400, "Invalid branch or branch must be an ObjectId");
  }
  if (!address || typeof address !== "object") {
    throw new ApiError(400, "Invalid address");
  }

  const response = await TeacherService.createTeacher({
    name,
    teacherPhone,
    email: req.body.email || "",
    password,
    tenant,
    branch,
    address,
    qualification,
    subjects,
    status: TeacherStatus.ACTIVE,
    file: req.file,
  });

  return res.status(response.statusCode).json(response);
});

export const loginTeacher = asyncHandler(async (req: Request, res: Response) => {
  const { teacherPhone, password } = req.body;

  if (!teacherPhone || typeof teacherPhone !== "string") {
    throw new ApiError(400, "Invalid phone");
  }
  if (!/^\d{10}$/.test(teacherPhone)) {
    throw new ApiError(400, "Phone number must be 10 digits");
  }
  if (!password || password.trim().length < 6) {
    throw new ApiError(400, "Invalid password or password must be at least 6 characters");
  }

  const response = await TeacherService.loginTeacher(teacherPhone, password);
  return res.status(response.statusCode).json(response);
});

// Change password handler
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const teacherId = String(req.body.teacherId);
  const { oldPassword, newPassword } = req.body;
  if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
    throw new ApiError(400, "Invalid teacherId");
  }
  if (!oldPassword || typeof oldPassword !== "string") {
    throw new ApiError(400, "Invalid old password");
  }
  if (!newPassword || newPassword.trim().length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters");
  }
  const response = await TeacherService.changePassword(teacherId, oldPassword, newPassword);
  return res.status(response.statusCode).json(response);
});

// Get all teachers
export const getAllTeachers = asyncHandler(async (req: Request, res: Response) => {
  const response = await TeacherService.getAllTeachers();
  return res.status(response.statusCode).json(response);
});

// Get teacher by ID
export const getTeacherById = asyncHandler(async (req: Request, res: Response) => {
  const teacherId = String(req.params.teacherId);
  if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
    throw new ApiError(400, "Invalid teacherId");
  }
  const response = await TeacherService.getTeacherById(teacherId);
  return res.status(response.statusCode).json(response);
});

// Update teacher
export const updateTeacher = asyncHandler(async (req: Request, res: Response) => {
  const teacherId = String(req.params.teacherId);
  if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
    throw new ApiError(400, "Invalid teacherId");
  }
  const response = await TeacherService.updateTeacher(teacherId, req.body, req.file);
  return res.status(response.statusCode).json(response);
});

// Delete teacher
export const deleteTeacher = asyncHandler(async (req: Request, res: Response) => {
  const teacherId = String(req.params.teacherId);
  if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
    throw new ApiError(400, "Invalid teacherId");
  }
  const response = await TeacherService.deleteTeacher(teacherId);
  return res.status(response.statusCode).json(response);
});
