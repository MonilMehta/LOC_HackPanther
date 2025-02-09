import mongoose, { Schema } from "mongoose";

const ReportBySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  location: {
    street: {
      type: String,
      required: [true, "Street is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      trim: true,
    },
  },
  type_of_crime: {
    type: String,
    enum: [
      "theft",
      "assault",
      "cyber_crime",
      "fraud",
      "murder",
      "extortion",
      "kidnapping",
      "others",
    ],
    required: [true, "Type of crime is required"],
  },
  date: {
    type: String,
  },
  time: {
    type: String,
    required: [true, "Time is required"],
    trim: true,
  },
  evidence_photo_url: {
    type: String,
    trim: true,
  },
  is_checked:{
    type: Boolean,
    default: false
  }
});

export const ReportBy = mongoose.model("ReportBy", ReportBySchema);
