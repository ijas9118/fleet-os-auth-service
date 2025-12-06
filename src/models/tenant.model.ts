import type { Document } from "mongoose";

import { TenantStatus } from "@ahammedijas/fleet-os-shared";
import { model, Schema } from "mongoose";

export interface ITenant extends Document<string> {
  tenantId: string;
  name: string;
  industry?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    tenantId: { type: String, unique: true, required: true },

    name: { type: String, required: true },

    industry: { type: String },

    contactEmail: { type: String, required: true },

    contactPhone: { type: String },

    address: {
      line1: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },

    status: {
      type: String,
      enum: Object.values(TenantStatus),
      default: TenantStatus.PENDING_VERIFICATION,
    },
  },
  { timestamps: true },
);

export const Tenant = model<ITenant>("Tenant", TenantSchema);
export default Tenant;
