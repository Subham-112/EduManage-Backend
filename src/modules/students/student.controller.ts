import { Request, Response } from "express";
import mongoose from "mongoose";
import { studentService } from "./student.service";
import { isPhoneOrEmail, validateEmail, validatePassword, validatePhone } from "../../utils/validate.helper";
import { getAuthUser } from "../../utils/authUser";
import ApiError from "../../utils/ApiError";

export const createStudent = async (req: Request, res: Response) => {
  const { tenant, name, phone, email, password, agreedToTerms } = req.body;

  if (tenant && !mongoose.Types.ObjectId.isValid(tenant)) {
    throw new ApiError(400, "Invalid tenant ID");
  }

  if (!name || !phone || !password) {
    throw new ApiError(400, "Name, phone, and password are required");
  }

  if (email && !validateEmail(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  if (!validatePhone(phone)) {
    throw new ApiError(400, "Invalid phone number format");
  }

  if (!validatePassword(password)) {
    throw new ApiError(400, "Invalid password format. Password must be at least 6 characters long and contain at least one number and one capital letter and one symbol");
  }

  if (typeof agreedToTerms !== "boolean") {
    throw new ApiError(400, "agreedToTerms must be a boolean value");
  }

  const response = await studentService.createStudent({
    tenant,
    name,
    phone,
    email,
    password,
    agreedToTerms,
  });
  return res.status(response.statusCode).json(response);
};

export const loginStudent = async (req: Request, res: Response) => {
    const { identifier, password } = req.body;

    let phone: string | null = null;
    let email: string | null = null;
    const phoneOrEmail = isPhoneOrEmail(identifier);

    if (phoneOrEmail === "phone") {
        phone = identifier;
    } else if (phoneOrEmail === "email") {
        email = identifier;
    }

    // Require at least one identifier (phone OR email)
    if (!phone && !email) {
      throw new ApiError(400, "Phone or email is required");
    }

    // Validate whichever identifier was provided
    phone && validatePhone(phone, false);
    email && validateEmail(email, false);
    validatePassword(password);

    const response = await studentService.loginStudent({ phone: phone ?? undefined, email: email ?? undefined, password }, res);
    return res.status(response.statusCode).json(response);
};

export const logoutStudent = async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const response = await studentService.logoutStudent(authUser, res);
  return res.status(response.statusCode).json(response);
}
