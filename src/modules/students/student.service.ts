import Student from "../../models/student.model";
import mongoose from "mongoose";
import { comparePassword, hashPassword } from "../../utils/bcrypt.helper";
import { generateAccessToken, JwtPayload } from "../../utils/jwt.helper";
import { Response } from "express";
import { config } from "../../config/config";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";

export const studentService = {
  async createStudent(data: {
    tenant: string;
    name: string;
    phone: string;
    email?: string;
    password: string;
    agreedToTerms: boolean;
  }) {
    const hashedPassword = await hashPassword(data.password);
    const payload = {
      tenant: new mongoose.Types.ObjectId(data.tenant),
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      agreedToTerms: data.agreedToTerms,
    };
    const student = await Student.create(payload);
    const studentResponse = student.toObject ? student.toObject() : student;
    if (studentResponse && typeof studentResponse === 'object') {
      delete (studentResponse as any).password;
      delete (studentResponse as any).refreshToken;
    }
    return new ApiResponse(201, studentResponse, "Student created successfully");
  },

  async loginStudent(data: { phone?: string; email?: string; password: string }, res: Response) {
    const query: any = data.phone ? { phone: data.phone } : { email: data.email };
    const student = await Student.findOne(query)
        .select("name phone email password refreshToken");
    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const isMatch = await comparePassword(data.password, student.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid password");
    }

    const payload: JwtPayload = {
      _id: String(student._id),
      role: "student",
      phone: student.phone,
      email: student.email,
    }
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateAccessToken(payload);
    student.refreshToken = refreshToken;
    await student.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.mode === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    const studentObj = student.toObject ? student.toObject() : student;
    if (studentObj && typeof studentObj === 'object') {
      delete (studentObj as any).password;
      delete (studentObj as any).refreshToken;
    }
    return new ApiResponse(200, { student: studentObj, token: accessToken }, "Login successful");
  },

  async logoutStudent(authUser: JwtPayload, res: Response) {
    const student = await Student.findById(authUser._id);
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
    student.refreshToken = undefined;
    await student.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.mode === "production",
      sameSite: "strict",
    });
    return new ApiResponse(200, null, "Logout successful");
  }
};
