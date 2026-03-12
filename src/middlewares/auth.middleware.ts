import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import { config } from "../config/config";
import { verifyAccessToken } from "../utils/token";

// Define user roles
export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  OWNER = "owner",
  TENANT = "tenant",
  ADMIN = "admin",
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    phone: string;
    role: UserRole;
    tenantId?: string;
    branchId?: string;
  };
}

/**
 * Authenticate middleware - Verifies JWT token and extracts user information
 * Token should be provided in Authorization header as "Bearer <token>"
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(
        401,
        "No token provided or invalid token format. Use 'Bearer <token>'",
        null,
        ["Missing or malformed authorization header"],
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const jwtSecret = config.jwt.secret;
    if (!jwtSecret) {
      throw new ApiError(500, "JWT secret is not configured", null, [
        "Missing JWT_SECRET in environment variables",
      ]);
    }

    const decoded = verifyAccessToken(token) as JwtPayload;

    // Attach user info to request
    (req as AuthenticatedRequest).user = {
      id: decoded.user.id || decoded.sub,
      phone: decoded.user.phone,
      role: decoded.user.role,
      tenantId: decoded.user.tenantId,
      branchId: decoded.user.branchId,
    };

    next();
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      next(
        new ApiError(401, "Token has expired", null, [
          "Token expiration time exceeded",
        ]),
      );
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(
        new ApiError(401, "Invalid token", null, [
          "Token signature verification failed",
        ]),
      );
    } else if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(401, "Authentication failed", null, [
          error.message || "Unknown authentication error",
        ]),
      );
    }
  }
};

/**
 * Authorize middleware factory - Checks if user has required role(s)
 * Can accept single role or array of roles
 *
 * @param allowedRoles - Single role or array of allowed roles
 * @returns Express middleware function
 *
 * @example
 * // Single role
 * router.post('/admin', authorize(UserRole.ADMIN), controller);
 *
 * // Multiple roles
 * router.post('/edit', authorize([UserRole.OWNER, UserRole.ADMIN]), controller);
 */
export const authorize = (allowedRoles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    try {
      // Check if user is authenticated
      if (!user) {
        throw new ApiError(401, "User not authenticated", null, [
          "Missing user context",
        ]);
      }

      // Convert single role to array for consistent checking
      const rolesArray = Array.isArray(allowedRoles)
        ? allowedRoles
        : [allowedRoles];

      // Check if user's role is in allowed roles
      if (!rolesArray.includes(user.role)) {
        throw new ApiError(
          403,
          `Access denied. Required role(s): ${rolesArray.join(", ")}`,
          null,
          [
            `User has role '${user.role}' but requires one of: ${rolesArray.join(
              ", ",
            )}`,
          ],
        );
      }

      next();
    } catch (error: any) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        next(
          new ApiError(403, "Authorization failed", null, [
            error.message || "Unknown authorization error",
          ]),
        );
      }
    }
  };
};

/**
 * Optional middleware - Only authenticate if token is provided
 * Doesn't throw error if no token, but adds user info if token exists
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // Continue without user context
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return next(); // Continue without user context
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    (req as AuthenticatedRequest).user = {
      id: decoded.id || decoded.sub,
      phone: decoded.phone,
      role: decoded.role,
      tenantId: decoded.tenantId,
      branchId: decoded.branchId,
    };

    next();
  } catch (error) {
    // Silently ignore token errors for optional auth
    next();
  }
};
