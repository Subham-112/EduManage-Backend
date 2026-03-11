import mongoose, { Schema } from "mongoose";
import { TenantStatus } from "../config/enums";

export interface ITenantAvatar {
    url: string;
    key?: string;
    name?: string;
    size?: number;
    mimetype?: string;
    originalname?: string;
}

export interface ITenant {
    name: string;
    tenantPhone: string;
    email?: string;
    password: string;
    image?: ITenantAvatar;

    branches: any[];
    numberOfStudents: number;
    numberOfTeachers: number;

    status: TenantStatus;
    review?: string;

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

export const TenantSchema = new Schema<ITenant>({
    name: { type: String, required: true },
    tenantPhone: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },
    image: { type: TenantAvatarSchema },

    branches: [{ type: Schema.Types.ObjectId, ref: "Branch" }],
    numberOfStudents: { type: Number, default: 0 },
    numberOfTeachers: { type: Number, default: 0 },

    status: { type: String, enum: Object.values(TenantStatus), default: TenantStatus.REVIEW },
    review: { type: String },
}, { timestamps: true });

const TenantModel = mongoose.model<ITenant>("Tenant", TenantSchema);

export default TenantModel;
