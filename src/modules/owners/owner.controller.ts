import { Request, Response } from "express";
import ApiError from "../../utils/ApiError";
import {
  isPhoneOrEmail,
  validateEmail,
  validatePassword,
  validatePhone,
} from "../../utils/validate.helper";
import { OwnerService } from "./owner.service";
import { getAuthUser } from "../../utils/authUser";

export const createOwner = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, phone } = req.body;

  if (!firstName || !lastName) {
    throw new ApiError(400, "First name and last name are required");
  }

  validateEmail(email);
  validatePassword(password);
  phone && validatePhone(phone, false);

  const response = await OwnerService.createOwner({
    firstName,
    lastName,
    email,
    password,
    phone,
    ...req.body,
  });

  return res.status(response.statusCode).json(response);
};

export const loginOwner = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  let phone: string | null = "";
  let email: string | null = "";
  const phoneOrEmail: "phone" | "email" = isPhoneOrEmail(identifier);
  if (phoneOrEmail === "phone") {
    phone = identifier;
  } else {
    email = identifier;
  }

  phone && validatePhone(phone, false);
  email && validateEmail(email, false);
  validatePassword(password);

  const response = await OwnerService.loginOwner(res, {
    phone: phone ? phone : undefined,
    email: email ? email : undefined,
    password,
  });
  return res.status(response.statusCode).json(response);
};

export const logoutOwner = async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const response = await OwnerService.logoutOwner(authUser, res);
  return res.status(response.statusCode).json(response);
}
