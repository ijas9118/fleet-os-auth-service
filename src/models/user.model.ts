import type { UserRole } from "@ahammedijas/fleet-os-shared";
import type { Document } from "mongoose";

import { model, Schema } from "mongoose";

export interface IUser extends Document<string> {
  email: string;
  password: string | null;
  name: string;
  role: UserRole;
  tenantId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 8,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: [
        "PLATFORM_ADMIN",
        "TENANT_ADMIN",
        "OPERATIONS_MANAGER",
        "WAREHOUSE_MANAGER",
        "DRIVER",
      ],
      required: true,
    },
    tenantId: {
      type: String,
    },
    lastLoginAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = model<IUser>("User", userSchema);
export default User;
