import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  loginId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loggedInAt: {
    type: Date,
    default: Date.now
  },
  loggedOutAt: {
    type: Date
  },
  ip: String,
  os: String,
  browser: String
}, {
  timestamps: true
});

const Log = mongoose.model('Log', logSchema);
export default Log;
