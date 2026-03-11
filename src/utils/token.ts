import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config/config";

const jwtSecret = config.jwt.secret;
const expiry = config.jwt.expiresIn as SignOptions["expiresIn"];

export const generateAccessToken = (payload: any) => {
  try {
    if (!jwtSecret || !expiry) {
      throw new Error("JWT secret or expiration time is not configured");
    }
    return jwt.sign(payload, jwtSecret as string, { expiresIn: expiry });
  } catch (error) {
    throw new Error("Failed to generate access token");
  }
};

export const verifyAccessToken = (token: string) => {
  try {
    if (!jwtSecret) {
      throw new Error("JWT secret is not configured");
    }
    return jwt.verify(token, jwtSecret as string);
  } catch (error) {
    throw new Error("Failed to verify access token");
  }
};
