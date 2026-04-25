import { Request } from "express";

export interface AuthenticateUser extends Request {
  user?: {
    _id: string;
    role: "admin" | "guest" | "owner" | "teacher" | "system" | "student";
    email?: string;
    phone: string;
  };
}

export const getAuthUser = (req: AuthenticateUser) => {
  const authUser = req.user;
  if (!authUser || !authUser._id) {
    throw new Error("Unauthorized");
  }
  return authUser;
};
