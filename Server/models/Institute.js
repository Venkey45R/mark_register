import mongoose from 'mongoose';

const instituteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  instituteCode: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['school', 'college'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Institute = mongoose.model('Institute', instituteSchema);
export default Institute;
