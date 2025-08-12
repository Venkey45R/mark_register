import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  questionNumber: Number,
  correctOption: String,
  selectedOption: String
}, { _id: false });

const responseSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  examName: {
    type: String,
    required: true
  },
  examSet: String,
  totalMarks: Number,
  grade: String,
  rank: Number,
  correctAnswers: Number,
  incorrectAnswers: Number,
  notAttempted: Number,
  subjectScores: {
    subject1: Number,
    subject2: Number,
    subject3: Number,
    subject4: Number,
  },
  subjectRanks: {
    subject1: Number,
    subject2: Number,
    subject3: Number,
    subject4: Number,
  },
  answers: [AnswerSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Response = mongoose.model('Response', responseSchema);
export default Response;
