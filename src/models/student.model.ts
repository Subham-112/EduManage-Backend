import mongoose, { Schema } from "mongoose";
import { StudentStatus } from "../config/enums";

export interface IImage {
  url: string;
  key?: string;
  name?: string;
  size?: number;
  mimetype?: string;
  originalname?: string;
}

export interface IStudent {
  name: string;
  phone: string;
  email?: string;
  password: string;

  avatar: IImage;
  status: StudentStatus;

  // Tenant Details
  standard: string;
  rollNo: string;
  tenant: Schema.Types.ObjectId;
  branch: Schema.Types.ObjectId;

  aadhar: {
    number: string;
    image: IImage;
  };

  parents: {
    father: string;
    mother: string;
    phone: string;
  };

  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    url: { type: String, required: true },
    key: { type: String },
    name: { type: String },
    size: { type: Number },
    mimetype: { type: String },
    originalname: { type: String },
  },
  { _id: false }
);

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },

    avatar: { type: ImageSchema },
    status: {
      type: String,
      enum: Object.values(StudentStatus),
      required: true,
    },

    // Tenant Details
    standard: { type: String, required: true },
    rollNo: { type: String, required: true },
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },

    aadhar: {
      number: { type: String },
      image: { type: ImageSchema },
    },

    parents: {
      father: { type: String },
      mother: { type: String },
      phone: { type: String },
    },

    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true, // auto-manages createdAt & updatedAt
  }
);

const Student = mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
