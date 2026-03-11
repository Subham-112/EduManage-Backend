import mongoose, { Schema } from "mongoose";
import { BranchStatus } from "../config/enums";

export interface IBranch {
    tenant: Schema.Types.ObjectId; // Reference to Tenant (ObjectId)
    branchName: string;
    phone?: string;
    email?: string;
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
    numberOfStudents: number;
    numberOfTeachers: number;
    status: BranchStatus;
    createdAt: Date;
    updatedAt: Date;
}

export const BranchSchema = new Schema<IBranch>({
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant" },
    branchName: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    area: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    landmark: { type: String },
    postalCode: { type: String, required: true },
    geoLocation: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    numberOfStudents: { type: Number, default: 0 },
    numberOfTeachers: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(BranchStatus), default: BranchStatus.ACTIVE },
}, { timestamps: true });

const Branch = mongoose.model<IBranch>("Branch", BranchSchema);

export default Branch;
