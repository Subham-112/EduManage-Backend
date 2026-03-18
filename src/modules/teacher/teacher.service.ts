import Teacher from "../../models/teacher.model";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import { hashPassword, comparePasswords } from "../../utils/password.util";
import { handleAvatarUpload } from "../../utils/handleAvatarUpload";
import { TeacherStatus } from "../../config/enums";
import { logger } from "../../utils/logger.util";
import { UserRole } from "../../middlewares/auth.middleware";
import { generateAccessToken } from "../../utils/token";

interface ICreateTeacherPayload {
  name: string;
  teacherPhone: string;
  email?: string;
  password: string;
  tenant: string;
  branch: string;
  address: any;
  qualification?: any;
  subjects?: string[];
  status: TeacherStatus;
  file?: Express.Multer.File;
}

export const TeacherService = {
  async createTeacher(payload: ICreateTeacherPayload) {
    const isTeacherExist = await Teacher.findOne({ teacherPhone: payload.teacherPhone }).lean();
    if (isTeacherExist) {
      throw new ApiError(400, "Teacher already exists");
    }
    const hashedPass = await hashPassword(payload.password);
    const teacherData: any = {
      name: payload.name,
      teacherPhone: payload.teacherPhone,
      email: payload.email,
      password: hashedPass,
      tenant: payload.tenant,
      branch: payload.branch,
      address: payload.address,
      qualification: payload.qualification,
      subjects: payload.subjects,
      status: TeacherStatus.ACTIVE,
    };
    const newTeacher = await Teacher.create(teacherData);

    if (payload.file) {
      logger.info(`Starting avatar upload for teacher: ${newTeacher._id}`);
      handleAvatarUpload(
        newTeacher._id.toString(),
        payload.file,
        `tenant_${payload.tenant}/teacher/avatar`,
        "teacher",
        "avatar"
      );
    }
    return new ApiResponse(200, newTeacher.toObject(), "Teacher created successfully");
  },

  async loginTeacher(teacherPhone: string, password: string) {
    const teacher = await Teacher.findOne({ teacherPhone }).lean();
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    const isMatch = await comparePasswords(password, teacher.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid credentials");
    }
    const token = generateAccessToken({
      id: teacher._id,
      role: UserRole.TEACHER,
      tenant: teacher.tenant,
      branch: teacher.branch,
    });
    return new ApiResponse(200, { token, teacher }, "Login successful");
  },

  async changePassword(teacherId: string, oldPassword: string, newPassword: string) {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    const isMatch = await comparePasswords(oldPassword, teacher.password);
    if (!isMatch) {
      throw new ApiError(401, "Old password is incorrect");
    }
    teacher.password = await hashPassword(newPassword);
    await teacher.save();
    return new ApiResponse(200, null, "Password changed successfully");
  },

  async getAllTeachers() {
    const teachers = await Teacher.find().lean();
    return new ApiResponse(200, teachers, "All teachers fetched successfully");
  },

  async getTeacherById(teacherId: string) {
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    return new ApiResponse(200, teacher, "Teacher fetched successfully");
  },

  async updateTeacher(teacherId: string, updateData: any, file?: Express.Multer.File) {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    Object.assign(teacher, updateData);
    await teacher.save();
    if (file) {
      await handleAvatarUpload(
        teacher._id.toString(),
        file,
        `tenant_${teacher.tenant}/teacher/avatar`,
        "teacher",
        "avatar"
      );
    }
    return new ApiResponse(200, teacher.toObject(), "Teacher updated successfully");
  },

  async deleteTeacher(teacherId: string) {
    const teacher = await Teacher.findByIdAndDelete(teacherId);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    return new ApiResponse(200, null, "Teacher deleted successfully");
  },
};
