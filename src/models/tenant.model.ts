import mongoose, { Schema } from "mongoose";
import { SubscriptionPlan, TenantStatus } from "../config/enums";

export interface ITenantAvatar {
  url: string;
  key?: string;
  name?: string;
  size?: number;
  mimetype?: string;
  originalname?: string;
}

export interface ITenant {
  owner: Schema.Types.ObjectId; // Reference to Owner
  name: string;
  slug: string;
  description?: string;
  phone: string;
  email?: string;
  isEmailVerified: boolean;

  logo?: ITenantAvatar;
  images?: ITenantAvatar[];

  branches: Schema.Types.ObjectId[];
  numberOfStudents: number;
  numberOfTeachers: number;

  status: TenantStatus;
  verifiedAt?: Date;
  review?: string;

  createdByUser?: {
    id: Schema.Types.ObjectId;
    role: string;
  };

  subscription: Schema.Types.ObjectId;
  planType: string;

  billingInfo?: {
    email?: string;
    gstNumber?: string;
    companyName?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

export const TenantAvatarSchema = new Schema<ITenantAvatar>({
  url: { type: String, required: true },
  key: { type: String },
  name: { type: String },
  size: { type: Number },
  mimetype: { type: String },
  originalname: { type: String },
});

export const TenantSchema = new Schema<ITenant>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
    name: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    isEmailVerified: { type: Boolean, default: false },

    logo: { type: TenantAvatarSchema },
    images: { type: [TenantAvatarSchema] },

    branches: [{ type: Schema.Types.ObjectId, ref: "Branch" }],
    numberOfStudents: { type: Number, default: 0 },
    numberOfTeachers: { type: Number, default: 0 },

    status: {
      type: String,
      enum: Object.values(TenantStatus),
      default: TenantStatus.REVIEW,
    },
    verifiedAt: { type: Date },
    review: { type: String },

    createdByUser: {
      id: { type: Schema.Types.ObjectId },
      role: { type: String },
    },

    subscription: { type: Schema.Types.ObjectId, ref: "Subscription" },
    planType: {
      type: String,
      enum: Object.values(SubscriptionPlan),
      default: SubscriptionPlan.FREE,
    },

    billingInfo: {
      email: { type: String },
      gstNumber: { type: String },
      companyName: { type: String },
    },
  },
  { timestamps: true },
);

const TenantModel = mongoose.model<ITenant>("Tenant", TenantSchema);

export default TenantModel;
