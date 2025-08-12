import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  institution: {
  type: String,
  required: true
  },
  role: {
    type: String,
    enum: ['incharge', 'principal', 'admin', 'head', 'manager', 'unassigned'],
    required: true
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
