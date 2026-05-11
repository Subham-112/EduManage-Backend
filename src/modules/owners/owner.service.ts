import { Response } from "express";
import { IOwner, Owner } from "../../models/owner.model";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import { comparePassword, hashPassword } from "../../utils/bcrypt.helper";
import {
  generateAccessToken,
  generateRefreshToken,
  JwtPayload,
} from "../../utils/jwt.helper";
import { config } from "../../config/config";

export const OwnerService = {
  async createOwner(payload: IOwner) {
    const password = payload.password;
    // Hash the password before saving to the database
    const hashedPassword = await hashPassword(password);

    const owner = await Owner.create({ ...payload, password: hashedPassword });
    return new ApiResponse(201, owner, "Owner created successfully");
  },

  async loginOwner(
    res: Response,
    payload: {
      email: string | undefined;
      phone: string | undefined;
      password: string;
    },
  ) {
    const query = payload.phone
      ? { phone: payload.phone }
      : { email: payload.email };
    const owner = await Owner.findOne(query);

    if (!owner) {
      return new ApiError(404, "Owner not found");
    }

    const isPasswordValid = await comparePassword(
      payload.password,
      owner.password,
    );
    if (!isPasswordValid) {
      return new ApiError(401, "Invalid password");
    }

    const authPayload: JwtPayload = {
      _id: String(owner._id),
      role: "owner",
      phone: owner.phone,
      email: owner.email,
    };

    const refreshToken = await generateRefreshToken(authPayload);
    const accessToken = await generateAccessToken(authPayload);
    owner.refreshToken = refreshToken;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: config.mode === "prod",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    await owner.save();

    const ownerObj = owner.toObject() ? owner.toObject() : owner;
    if (ownerObj && typeof ownerObj === "object") {
        delete (ownerObj as any).password
        delete (ownerObj as any).refreshToken
    }

    return new ApiResponse(
      200,
      { ...ownerObj, token: accessToken },
      "Login successful",
    );
  },

  async logoutOwner(authUser: JwtPayload, res: Response) {
    const owner = await Owner.findById(authUser._id);
    if (!owner) {
      throw new ApiError(404, "Owner not found");
    }

    owner.refreshToken = ""
    await owner.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: config.mode === "prod",
    });

    return new ApiResponse(200, null, "Logout Successfully");
  }
};
