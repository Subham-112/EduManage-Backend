import Student from "../../models/student.model";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import { hashPassword, comparePasswords } from "../../utils/password.util";
import { handleAvatarUpload } from "../../utils/handleAvatarUpload";
import { StudentStatus } from "../../config/enums";
import { logger } from "../../utils/logger.util";
import { UserRole } from "../../middlewares/auth.middleware";
import { generateAccessToken } from "../../utils/token";

interface ICreateStudentPayload {
  name: string;
  phone: string;
  email?: string;
  password: string;
  standard: string;
  rollNo: string;
  tenant: string;
  branch: string;
  status: StudentStatus;
  file?: Express.Multer.File;
}

export const StudentService = {
  async createStudent(payload: ICreateStudentPayload) {
    const isStudentExist = await Student.findOne({ phone: payload.phone }).lean();
    if (isStudentExist) {
      throw new ApiError(400, "Student already exists");
    }
    const hashedPass = await hashPassword(payload.password);
    const studentData: any = {
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      password: hashedPass,
      standard: payload.standard,
      rollNo: payload.rollNo,
      tenant: payload.tenant,
      branch: payload.branch,
      status: StudentStatus.ACTIVE,
    };
    const newStudent = await Student.create(studentData);

    if (payload.file) {
      logger.info(`Starting avatar upload for student: ${newStudent._id}`);
      handleAvatarUpload(
        newStudent._id.toString(),
        payload.file,
        `tenant_${payload.tenant}/student/avatar`,
        "student",
        "avatar"
      );
    }
    return new ApiResponse(200, newStudent.toObject(), "Student created successfully");
  },

  async loginStudent(phone: string, password: string) {
    const student = await Student.findOne({ phone }).lean();
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
    const isPasswordValid = await comparePasswords(password, student.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const payload = {
      user: {
        id: String(student._id),
        phone: student.phone,
        role: UserRole.STUDENT,
        tenantId: student.tenant,
        branchId: student.branch,
      },
    };
    const accessToken = await generateAccessToken(payload);

    const result = { accessToken, ...student };
    return new ApiResponse(200, result, "Student logged in successfully");
  },

  async changePassword(phone: string, oldPassword: string, newPassword: string) {
    const student = await Student.findOne({ phone });
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
    const isOldPasswordValid = await comparePasswords(oldPassword, student.password);
    if (!isOldPasswordValid) {
      throw new ApiError(401, "Invalid old password");
    }
    student.password = await hashPassword(newPassword);
    await student.save();
    return new ApiResponse(200, student, "Password changed successfully");
  },

  async getAllStudents() {
    const students = await Student.find()
      .populate("tenant", "_id name tenantPhone status")
      .populate("branch")
      .lean();
    if (!students || students.length === 0) {
      throw new ApiError(404, "Students not found");
    }
    return new ApiResponse(201, students, "Students fetch successfully");
  },

  async getStudentById(studentId: string) {
    const student = await Student.findById(studentId)
      .populate("tenant", "_id name tenantPhone status")
      .populate("branch")
      .lean();
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
    return new ApiResponse(200, student, "Student fetched successfully");
  },

  async getActiveStudents() {
    const students = await Student.find({ status: StudentStatus.ACTIVE })
      .populate("tenant", "_id name tenantPhone status")
      .populate("branch")
      .lean();
    if (!students || students.length === 0) {
      throw new ApiError(404, "Students not found");
    }
    return new ApiResponse(201, students, "Active Students fetch successfully");
  },

  async updateStudent(studentId: string, payload: any, file?: Express.Multer.File) {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    student.name = payload.name || student.name;
    student.phone = payload.phone || student.phone;
    student.email = payload.email || student.email;
    student.standard = payload.standard || student.standard;
    student.rollNo = payload.rollNo || student.rollNo;
    student.tenant = payload.tenant || student.tenant;
    student.branch = payload.branch || student.branch;
    
    await student.save();
    
    if (file) {
      logger.info(`Starting avatar upload for student: ${studentId}`);
      handleAvatarUpload(
        studentId,
        file,
        `tenant_${student.tenant}/student/avatar`,
        "student",
        "avatar"
      );
    }
    return new ApiResponse(200, student, "Student updated successfully");
  },

  async deleteStudent(studentId: string) {
    const student = await Student.findByIdAndDelete(studentId);
    return new ApiResponse(200, student, "Student account deleted successfully");
  },

  async updateAadhar(studentId: string, payload: any, file?: Express.Multer.File) {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
    student.aadhar = {
      number: payload.number,
      image: student.aadhar.image,
    };
    await student.save();
    if (file) {
      logger.info(`Starting aadhar image upload for student: ${studentId}`);
      await handleAvatarUpload(
        studentId,
        file,
        `tenant_${student.tenant}/student/aadhar`,
        "student",
        "aadhar.image"
      );
    }
    return new ApiResponse(200, student, "Aadhar updated successfully");
  }
};
