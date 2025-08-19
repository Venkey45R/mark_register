import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  rollNo: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
  },
  exams: [
    {
      ExamType: { type: String, enum: ["IIT", "CDF"] },
      ExamName: { type: String },
      ExamData: { type: Object, required: true },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Student = mongoose.model("Student", studentSchema);
export default Student;
