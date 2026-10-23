import { Schema, model, type InferSchemaType } from "mongoose";

export const UPLOAD_ASSET_STATUSES = [
  "pending",
  "finalizing",
  "attached",
] as const;

const uploadAssetSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    temporaryKey: {
      type: String,
      required: true,
      unique: true,
    },
    finalKey: {
      type: String,
      required: true,
      unique: true,
    },
    expectedSize: {
      type: Number,
      required: true,
      min: 1,
    },
    contentType: {
      type: String,
      enum: ["image/webp"],
      required: true,
    },
    status: {
      type: String,
      enum: UPLOAD_ASSET_STATUSES,
      default: "pending",
      required: true,
    },
    visitLogId: {
      type: Schema.Types.ObjectId,
      ref: "VisitLog",
      default: null,
    },
    finalizingAt: {
      type: Date,
      default: null,
    },
    attachedAt: {
      type: Date,
      default: null,
    },
    lastError: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

uploadAssetSchema.index({ userId: 1, status: 1, createdAt: -1 });
uploadAssetSchema.index({ status: 1, createdAt: 1 });
uploadAssetSchema.index({ status: 1, visitLogId: 1 });

export type UploadAssetSchemaType = InferSchemaType<typeof uploadAssetSchema>;

const UploadAssetModel = model("UploadAsset", uploadAssetSchema);

export default UploadAssetModel;
