import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone_no: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    date_of_birth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender:{
      type: String,
      enum: ["Male", "Female"],
      required: false
    },
    photo: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/10295/10295611.png",
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["admin", "officer"],
      required: true,
    },
    policeDetails: {
      badgeNumber: { type: String, unique: true, sparse: true },
      rank: { type: String },
      station: { type: String },
      assignedCases: [{ type: Schema.Types.ObjectId, ref: "Case" }],
      cases_solved: { type: Number, default: 0 },
      cases_pending: { type: Number, default: 0 },
      attendance_percentage: { type: Number, default: 0 }
    },
    avaliableLeave:{
      type: Number,
      default: 20,
    },
    usedLeave:{
      type: Number,
      default: 0
    },
    shift_type:{
      type: String,
      enum: ["Morning", "Evening", "Night"],
      required: false
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
