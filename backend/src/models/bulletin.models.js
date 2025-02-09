import mongoose, { Schema } from "mongoose";

const BulletinSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true
    },
    type:{
        type: String,
        enum: ["General", "Traffic", "Emergency", "Community", "Crime Alert" ],
        required: [true, "Type of leave is required"]
    }, 
    content: { 
      type: String, 
      required: true,
      trim: true 
    },
    priority: { 
      type: String, 
      enum: ["Normal", "High", "Urgent"],
      default: "Normal"
    },
  },
  { timestamps: true }
);

export const Bulletin = mongoose.model("Bulletin", BulletinSchema);
