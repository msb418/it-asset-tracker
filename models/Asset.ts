// models/Asset.ts
import mongoose, { Schema, model, models } from "mongoose";

export interface IAsset {
  name: string;
  assetType: string;
  serialNumber?: string;
  status?: "In Stock" | "Assigned" | "Repair" | "Retired";
  location?: string;
  assignedTo?: string;
  description?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  createdByEmail: string;
  deletedAt?: Date | null;
  assetTag?: string; // <- add
}

function genAssetTag() {
  // Simple readable tag like AST-8F2C9A
  return `AST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

const AssetSchema = new Schema<IAsset>(
  {
    name: { type: String, required: true, trim: true },
    assetType: { type: String, required: true, trim: true },

    serialNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ["In Stock", "Assigned", "Repair", "Retired"],
      default: "In Stock",
    },
    location: { type: String, trim: true },
    assignedTo: { type: String, trim: true },
    description: { type: String, trim: true },

    purchaseDate: { type: Date },
    warrantyExpiry: { type: Date },

    createdByEmail: { type: String, required: true, index: true },
    deletedAt: { type: Date, default: null, index: true },

    // NEW: unique + sparse avoids the “null duplicates” problem.
    assetTag: {
      type: String,
      default: genAssetTag,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default models.Asset || model<IAsset>("Asset", AssetSchema);