import mongoose, { Schema } from "mongoose";
import { StudentStaus } from "../config/enums";

export interface IStudentAddress {
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

export interface IParentDetails {
    father: string;
    mother: string;
    phone?: string;
    email?: string;
}

export interface IStudentAvtar {
    url: string;
    key?: string;
    name?: string;
    size?: number;
    mimetype?: string;
    originalname?: string;
}

export interface IStudentMetaData {
    avg_score: string;
    avg_present: string;
}

export interface IStudent {
    name: string;
    studentPhone: string;
    email?: string;
    password: string;
    avatar?: IStudentAvtar;

    class: string;
    rollno: string;
    tenant: string;
    branch?: string;
    batch: string;

    address: IStudentAddress;
    parentDetails: IParentDetails;

    status: StudentStaus;
    metaData: IStudentMetaData;

    createdAt: Date;
    updatedAt: Date;
}

export const AddressSchema = new Schema<IStudentAddress>({
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    landmark: { type: String },
    postalCode: { type: String, required: true },
    geoLocation: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
});

export const ParentDetailsSchema = new Schema<IParentDetails>({
    father: { type: String },
    mother: { type: String },
    phone: { type: String },
    email: { type: String },
});

export const StudentAvtarSchema = new Schema<IStudentAvtar>({
    url: { type: String, required: true },
    key: { type: String },
    name: { type: String },
    size: { type: Number },
    mimetype: { type: String },
    originalname: { type: String },
});

export const StudentMetaDataSchema = new Schema<IStudentMetaData>({
    avg_score: { type: String },
    avg_present: { type: String },
});

export const StudentSchema = new Schema<IStudent>({
    name: { type: String, required: true },
    studentPhone: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },
    avatar: { type: StudentAvtarSchema },

    class: { type: String, required: true },
    rollno: { type: String, required: true },
    tenant: { type: String, required: true },
    branch: { type: String },
    batch: { type: String, required: true },

    address: { type: AddressSchema, required: true },
    parentDetails: { type: ParentDetailsSchema, required: true },

    metaData: { type: StudentMetaDataSchema },
    status: { type: String, enum: Object.values(StudentStaus), default: StudentStaus.ACTIVE },
}, { timestamps: true });

const Student = mongoose.model<IStudent>("Student", StudentSchema);

export default Student;