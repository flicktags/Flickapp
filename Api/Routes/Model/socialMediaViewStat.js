const mongoose = require('mongoose');

const socialMediaViewStatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  socialMediaType: {
    type: String,
    required: true,
    trim: true,
  },
  viewedAt: {
    type: Date,
    default: () => new Date(Date.now() + 3 * 60 * 60 * 1000), // +3 hours offset
  },
});

// Optional: Index to speed up aggregation queries
socialMediaViewStatSchema.index({ userId: 1, socialMediaType: 1 });

const SocialMediaViewStat = mongoose.model('SocialMediaViewStat', socialMediaViewStatSchema);

module.exports = SocialMediaViewStat;
