const mongoose = require('mongoose');
const crypto = require('crypto');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accessId: {
    type: String,
    unique: true,
    default: function() {
      // Generate a random 8-character access ID
      return crypto.randomBytes(4).toString('hex');
    }
  },
  workoutPlans: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema);