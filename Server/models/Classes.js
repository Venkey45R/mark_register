import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  className: String,
  year: Number,
  section: String,
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  institute: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Class = mongoose.model("Class", classSchema);
export default Class;
