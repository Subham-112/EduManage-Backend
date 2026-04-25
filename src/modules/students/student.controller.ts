import { Request, Response } from "express";
import mongoose from "mongoose";
import { studentService } from "./student.service";
import { validateEmail, validatePassword, validatePhone } from "../../utils/validate.helper";
import { getAuthUser } from "../../utils/authUser";

export const createStudent = async (req: Request, res: Response) => {
  const { tenant, name, phone, email, password } = req.body;

  if (tenant && !mongoose.Types.ObjectId.isValid(tenant)) {
    return res.status(400).json({ message: "Invalid tenant ID" });
  }

  if (!name || !phone || !password) {
    return res
      .status(400)
      .json({ message: "Name, phone, and password are required" });
  }

  if (email && !validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!validatePhone(phone)) {
    return res.status(400).json({ message: "Invalid phone number format" });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ message: "Invalid password format" });
  }

  const response = await studentService.createStudent({
    tenant,
    name,
    phone,
    email,
    password,
  });
  return res.status(201).json(response);
};

export const loginStudent = async (req: Request, res: Response) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ message: "Phone and password are required" });
    }

    if (!validatePhone(phone)) {
        return res.status(400).json({ message: "Invalid phone number format" });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ message: "Invalid password format" });
    }

    const response = await studentService.loginStudent({ phone, password }, res);
    return res.status(200).json(response);
};

export const logoutStudent = async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const response = await studentService.logoutStudent(authUser, res);
  return res.status(200).json(response);
}
