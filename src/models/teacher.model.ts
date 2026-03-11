import mongoose, { Schema } from "mongoose";
import { TeacherStatus } from "../config/enums";

export interface ITeacherAddress {
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

export interface ITeacherAvatar {
  url: string;
  key?: string;
  name?: string;
  size?: number;
  mimetype?: string;
  originalname?: string;
}

export interface ITeacherQualification {
  degree: string;
  field: string;
  institution: string;
  year?: number;
}

export interface ITeacher {
  name: string;
  teacherPhone: string;
  email?: string;
  password: string;
  avatar?: ITeacherAvatar;

  tenant: string;
  branch: string;

  address: ITeacherAddress;
  qualification?: ITeacherQualification;
  subjects?: string[];

  status: TeacherStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const TeacherAddressSchema = new Schema<ITeacherAddress>({
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
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

export const TeacherAvatarSchema = new Schema<ITeacherAvatar>({
  url: { type: String, required: true },
  key: { type: String },
  name: { type: String },
  size: { type: Number },
  mimetype: { type: String },
  originalname: { type: String },
});

export const TeacherQualificationSchema = new Schema<ITeacherQualification>({
  degree: { type: String, required: true },
  field: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: Number },
});

export const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true },
    teacherPhone: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },
    avatar: { type: TeacherAvatarSchema },

    tenant: { type: String, required: true, ref: "Tenant" },
    branch: { type: String, required: true, ref: "Branch" },

    address: { type: TeacherAddressSchema, required: true },
    qualification: { type: TeacherQualificationSchema },
    subjects: [{ type: String }],

    status: {
      type: String,
      enum: Object.values(TeacherStatus),
      default: TeacherStatus.ACTIVE,
    },
  },
  { timestamps: true },
);

const Teacher = mongoose.model<ITeacher>("Teacher", TeacherSchema);

export default Teacher;
