import Student from "../../models/student.model";
import mongoose from "mongoose";
import { comparePassword, hashPassword } from "../../utils/bcrypt.helper";
import { generateAccessToken, JwtPayload } from "../../utils/jwt.helper";
import { Response } from "express";
import { config } from "../../config/config";

export const studentService = {
  async createStudent(data: {
    tenant: string;
    name: string;
    phone: string;
    email?: string;
    password: string;
  }) {
    const hashedPassword = await hashPassword(data.password);
    const payload = {
      tenant: new mongoose.Types.ObjectId(data.tenant),
      name: data.name,
      phone: data.phone,
      email: data.email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const student = await Student.create(payload);
    return student;
  },

  async loginStudent(data: { phone: string; password: string }, res: Response) {
    const student = await Student.findOne({ phone: data.phone })
        .select("name phone email password refreshToken");
    if (!student) {
      throw new Error("Student not found");
    }

    const isMatch = await comparePassword(data.password, student.password);
    if (!isMatch) {
      throw new Error("Invalid password");
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

    return {student: { ...student }, token: accessToken};
  },

  async logoutStudent(authUser: JwtPayload, res: Response) {
    const student = await Student.findById(authUser._id);
    if (!student) {
      throw new Error("Student not found");
    }
    student.refreshToken = undefined;
    await student.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.mode === "production",
      sameSite: "strict",
    });
  }
};
