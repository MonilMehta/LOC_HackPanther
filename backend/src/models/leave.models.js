// models/leave.model.js
import mongoose, { Schema } from "mongoose";

const LeaveSchema = new Schema(
  {
    officer: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    type:{
        type: String,
        enum: ["emergency", "annual", "sick", "personal" ],
        required: [true, "Type of leave is required"]
      }, 
    startDate: { 
      type: String, 
      required: true 
    },
    endDate: { 
      type: String, 
      required: true 
    },
    reason: { 
      type: String, 
      required: true,
      trim: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
  },
  { timestamps: true }
);

export const Leave = mongoose.model("Leave", LeaveSchema);
