const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User's _id
    required: true,
  },
  name: {
    type: String,
    required: false // Optionals
  },
  feedback: {
    type: String,
    required: true // Required
  },
  noofStars: {
    type: String, // ✅ Allow encrypted string
    required: true,
  },
  submittedAt: {
    type: Date,
    default: () => new Date(Date.now() + 3 * 60 * 60 * 1000) // Timezone offset +3 hours
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;