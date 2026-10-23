const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  pin: {
    type: String,
    required: true,
    select: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'MEKANIK'],
    required: true
  },
  machine: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function() {
  this.updated_at = Date.now();
});

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.pin;
  return user;
};

module.exports = mongoose.model('User', userSchema);
