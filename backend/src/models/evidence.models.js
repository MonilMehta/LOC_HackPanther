import mongoose, { Schema } from "mongoose";

const evidenceSchema = new Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    type: {
      type: String,
      enum: ["Photo", "Video", "Document"],
      required: true,
    },
    fileUrl: { type: String, required: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Evidence = mongoose.model("Evidence", evidenceSchema);
