import mongoose, { Schema } from "mongoose";
import { OwnerStatus } from "../config/enums";

export interface IOwnerAddress {
  area?: string;
  city: string;
  state: string;
  country: string;
  landmark?: string;
  postalCode: string;
  geoLocation?: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface IOwnerAvatar {
  url: string;
  key?: string;
  name?: string;
  size?: number;
  mimetype?: string;
  originalname?: string;
}

export interface IOwner {
  name: string;
  phone: string;
  email?: string;
  password: string;
  avatar?: IOwnerAvatar;

  tenant: string; // Reference to Tenant
  branch: string; // Reference to Branch

  status: OwnerStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const OwnerAvatarSchema = new Schema<IOwnerAvatar>({
  url: { type: String, required: true },
  key: { type: String },
  name: { type: String },
  size: { type: Number },
  mimetype: { type: String },
  originalname: { type: String },
}, { _id: false });

export const OwnerSchema = new Schema<IOwner>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },
    avatar: { type: OwnerAvatarSchema },

    tenant: { type: String, required: true, ref: "Tenant" },
    branch: { type: String, required: true, ref: "Branch" },

    status: {
      type: String,
      enum: Object.values(OwnerStatus),
      default: OwnerStatus.ACTIVE,
    },
  },
  { timestamps: true },
);

const Owner = mongoose.model<IOwner>("Owner", OwnerSchema);

export default Owner;
