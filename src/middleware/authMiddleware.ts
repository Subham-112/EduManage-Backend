import { NextFunction, RequestHandler, Response } from "express";
import { AuthenticateUser } from "../utils/authUser";
import {
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.helper";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import Student from "../models/student.model";

const ROLES = ["admin", "guest", "owner", "teacher", "system", "student"] as const;
export type Role = (typeof ROLES)[number];

export const authenticateToken = async (
  req: AuthenticateUser,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const accessToken = req.header("Authorization")?.split(" ")[1];
  const refreshToken = req.cookies?.refreshToken;

  if (!accessToken) {
    return res.status(401).json({ message: "Access token is missing" });
  }

  try {
    const decoded = verifyAccessToken(accessToken);
    req.user = {
      _id: decoded._id,
      role: decoded.role as Role,
      email: decoded.email,
      phone: decoded.phone,
    };

    const userId = decoded._id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Can't get user ID from access token" });
    }

    return next();
  } catch (err: any) {
    if (err instanceof TokenExpiredError && refreshToken) {
      try {
        const decodedRefresh = verifyRefreshToken(refreshToken);
        req.user = {
          _id: decodedRefresh._id,
          role: decodedRefresh.role as Role,
          email: decodedRefresh.email,
          phone: decodedRefresh.phone,
        };

        const userId = decodedRefresh._id;
        if (!userId) {
          return res
            .status(401)
            .json({ message: "Can't get user ID from refresh token" });
        }

        const user = await getUserByRole(decodedRefresh.role as Role, userId);
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        if (user.refreshToken !== refreshToken) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = generateAccessToken({
          _id: decodedRefresh._id as string,
          role: decodedRefresh.role as Role,
          email: user.email,
          phone: user.phone,
        });

        res.setHeader("Authorization", `Bearer ${newAccessToken}`);

        return next();
      } catch (refreshErr: any) {
        const msg =
          refreshErr instanceof JsonWebTokenError
            ? "Invalid refresh token."
            : "Invalid or expired refresh token.";
        return res.status(401).json({ status: false, message: msg });
      }
    } else {
      const msg =
        err instanceof JsonWebTokenError
          ? "Invalid access token."
          : "Invalid or expired access token.";
      return res.status(401).json({ status: false, message: msg });
    }
  }
};

export const authenticateRole = (...allowedRoles: Role[]): RequestHandler => {
  return (req: AuthenticateUser, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticateUser).user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        status: 401,
        message: "Unauthorized. Please log in.",
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        status: 403,
        message: `Forbidden: Your role '${user.role}' does not have permission to access this resource.`,
        allowedRoles,
      });
      return;
    }
    next();
  };
};


const getUserByRole = async (role: Role, userId: string) => {
  const modelMap: Record<string, any> = {
    student: Student,
    // teacher: Teacher,
    // admin: Admin,
  };
  const Model = modelMap[role];
  if (!Model) return null;
  const user = await Model.findById(userId).lean().exec();
  return user;
};
