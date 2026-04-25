import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config/config";

export interface JwtPayload {
  _id: string;
  role: string;
  email?: string;
  phone: string;
}

const JWT_SECRET = config.jwt.secret as string;
const JWT_EXPIRES_IN = config.jwt.expiresIn as SignOptions["expiresIn"];
const JWT_REFRESH_EXPIRES_IN = config.jwt
  .refreshExpiresIn as SignOptions["expiresIn"];
const JWT_REFRESH_SECRET = config.jwt.refreshSecret as string;

export const generateAccessToken = (
  payload: JwtPayload,
  options?: SignOptions,
): string => {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    ...options,
  });

  return token;
};

export const generateRefreshToken = (
  payload: JwtPayload,
  options?: SignOptions,
): string => {
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    ...options,
  });

  return refreshToken;
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};
