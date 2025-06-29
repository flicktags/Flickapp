// const mongoose = require('mongoose');

// const profileViewStatSchema = new mongoose.Schema({
//   userId: {
//     type: String,        // ← this must be String, not ObjectId
//     required: true,
//     unique: true
//   },
//   count: {
//     type: Number,
//     default: 1
//   },
//   lastViewedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// const ProfileViewStat = mongoose.model('ProfileViewStat', profileViewStatSchema);

// module.exports = ProfileViewStat;
const mongoose = require('mongoose');

const profileViewStatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // reference to User's _id
    required: true,
  },
  viewedAt: {
    type: Date,
    default: () => new Date(Date.now() + 3 * 60 * 60 * 1000), // +3 hours offset
  },
});

const ProfileViewStat = mongoose.model('ProfileViewStat', profileViewStatSchema);

module.exports = ProfileViewStat;

