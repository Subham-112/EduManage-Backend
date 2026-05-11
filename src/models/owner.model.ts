import mongoose, { Schema, Types } from "mongoose";
import { OwnerStatus } from "../modules/common/enum";

export interface IOwnerAvatar {
  url: string;
  key?: string;
  originalName?: string;
  name?: string;
  size?: number;
  mimetype?: string;
}

export interface IOwner {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;

  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;

  avatar?: IOwnerAvatar;
  status: OwnerStatus;
  tenants: Types.ObjectId[];
  activeTenants: Types.ObjectId[];

  lastLogin?: Date;
  fcmTokens?: string[];
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OwnerAvatarSchema = new Schema<IOwnerAvatar>(
  {
    url: { type: String, required: true },
    key: { type: String },
    originalName: { type: String },
    name: { type: String },
    size: { type: Number },
    mimetype: { type: String },
  },
  { _id: false },
);

const OwnerSchema = new Schema<IOwner>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true },
    password: { type: String, required: true },

    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },

    avatar: { type: OwnerAvatarSchema },
    status: {
      type: String,
      enum: Object.values(OwnerStatus),
      default: OwnerStatus.ACTIVE,
    },
    tenants: [{ type: Schema.Types.ObjectId, ref: "Tenant" }],
    activeTenants: [{ type: Schema.Types.ObjectId, ref: "Tenant" }],

    lastLogin: { type: Date },
    fcmTokens: [{ type: String }],
    refreshToken: { type: String },
  },
  { timestamps: true },
);

export const Owner = mongoose.model<IOwner>("Owner", OwnerSchema);
