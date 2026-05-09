import mongoose, { Schema, Types } from "mongoose";

interface IPhoto {
  url: string;
  originalName: string;
  size: number;
}

interface IParent {
  name: string;
  phone: string;
}

interface IStudent {
  tenant: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  isEmailVerified?: boolean;
  password: string;
  photo?: IPhoto;
  parents: IParent[];
  agreedToTerms?: boolean;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const photoSchema = new Schema<IPhoto>({
  url: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
});

const parentSchema = new Schema<IParent>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
});

const studentSchema = new Schema<IStudent>({
  tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  isEmailVerified: { type: Boolean, default: false },
  password: { type: String, required: true },
  photo: [{ type: photoSchema, default: null }],
  parents: [{ type: parentSchema, default: [] }],
  agreedToTerms: { type: Boolean, default: false },
  refreshToken: { type: String, default: null },
  createdAt: { type: Date },
  updatedAt: { type: Date },
});

const Student = mongoose.model<IStudent>("Student", studentSchema);

export default Student;
