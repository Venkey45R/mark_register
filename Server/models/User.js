import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute", // ✅ critical for populate
    },
    role: {
      type: String,
      enum: ["incharge", "principal", "admin", "manager", "unassigned"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
