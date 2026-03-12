import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import ApiError from "../../utils/ApiError";
import mongoose from "mongoose";
import { StudentService } from "./student.service";
import { StudentStatus } from "../../config/enums";

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, password, standard, rollNo, tenant, branch } = req.body;

  if (!name || typeof name !== "string") {
    throw new ApiError(400, "Invalid name");
  }
  if (!phone || typeof phone !== "string") {
    throw new ApiError(400, "Invalid phone");
  } else if (!/^\d{10}$/.test(phone)) {
    throw new ApiError(400, "Phone number must be 10 digits");
  }
  if (!password || password.trim().length < 6) {
    throw new ApiError(400, "Invalid password or password must be at least 6 characters");
  }
  if (!standard || typeof standard !== "string") {
    throw new ApiError(400, "Invalid standard");
  }
  if (!rollNo || typeof rollNo !== "string") {
    throw new ApiError(400, "Invalid rollNo");
  }
  if (!tenant || !mongoose.Types.ObjectId.isValid(tenant)) {
    throw new ApiError(400, "Invalid tenant or tenant must be an ObjectId");
  }
  if (!branch || !mongoose.Types.ObjectId.isValid(branch)) {
    throw new ApiError(400, "Invalid branch or branch must be an ObjectId");
  }

  const response = await StudentService.createStudent({
    name,
    phone,
    email: req.body.email || "",
    password,
    standard,
    rollNo,
    tenant,
    branch,
    status: StudentStatus.ACTIVE,
    file: req.file,
  });

  return res.status(response.statusCode).json(response);
});

export const loginStudent = asyncHandler(async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  if (!phone || typeof phone !== "string") {
    throw new ApiError(400, "Invalid phone");
  }
  if (!/^\d{10}$/.test(phone)) {
    throw new ApiError(400, "Phone number must be 10 digits");
  }
  if (!password || password.trim().length < 6) {
    throw new ApiError(400, "Invalid password or password must be at least 6 characters");
  }

  const response = await StudentService.loginStudent(phone, password);

  return res.status(response.statusCode).json(response);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { phone, oldPassword, newPassword } = req.body;

  if (!phone || typeof phone !== "string") {
    throw new ApiError(400, "Invalid phone");
  }
  if (!/^\d{10}$/.test(phone)) {
    throw new ApiError(400, "Phone number must be 10 digits");
  }
  if (!oldPassword || oldPassword.trim().length < 6) {
    throw new ApiError(400, "Invalid old password or old password must be at least 6 characters");
  }
  if (!newPassword || newPassword.trim().length < 6) {
    throw new ApiError(400, "Invalid new password or new password must be at least 6 characters");
  }
  if (oldPassword === newPassword) {
    throw new ApiError(400, "New password must be different from old password");
  }

  const response = await StudentService.changePassword(phone, oldPassword, newPassword);

  return res.status(response.statusCode).json(response);
});

export const getAllStudents = asyncHandler(async (req: Request, res: Response) => {
  const response = await StudentService.getAllStudents();
  return res.status(response.statusCode).json(response);
});

export const getStudentById = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  if (!studentId || !mongoose.Types.ObjectId.isValid(String(studentId))) {
    throw new ApiError(400, "Student Id is required or Invalid Student Id");
  }

  const response = await StudentService.getStudentById(String(studentId));
  return res.status(response.statusCode).json(response);
});

export const getActiveStudents = asyncHandler(async (req: Request, res: Response) => {
  const response = await StudentService.getActiveStudents();
  return res.status(response.statusCode).json(response);
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  if (!studentId || !mongoose.Types.ObjectId.isValid(String(studentId))) {
    throw new ApiError(400, "Student Id is required or Invalid Student Id");
  }

  const response = await StudentService.updateStudent(String(studentId), req.body, req.file);
  return res.status(response.statusCode).json(response);
});

export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  if (!studentId || !mongoose.Types.ObjectId.isValid(String(studentId))) {
    throw new ApiError(400, "Student Id is required or Invalid Student Id");
  }

  const response = await StudentService.deleteStudent(String(studentId));
  return res.status(response.statusCode).json(response);
});

export const updateAadhar = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  if (!studentId || !mongoose.Types.ObjectId.isValid(String(studentId))) {
    throw new ApiError(400, "Student Id is required or Invalid Student Id");
  }

  const response = await StudentService.updateAadhar(String(studentId), req.body, req.file);
  return res.status(response.statusCode).json(response);
});
