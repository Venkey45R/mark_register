import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    required: true,
    unique: true
  },
  ip: {
    type: String,
    required: true
  },
  os: String,
  browser: String,
  visitedAt: {
    type: Date,
    default: Date.now
  },
  url: String
});

const Visitor = mongoose.model('Visitor', visitorSchema);
export default Visitor;
