const mongoose = require('mongoose');

const shareInfoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  }, 
  jobTitle: {
    type: String,
    required: false
  },
  company: {
    type: String,
    required: false
  },
  notes:
  { type:String,
    required:false
  }
  ,
  sharedDate: {
    type: Date,
    default: Date.now
  } 
});

const ShareInfo = mongoose.model('ShareInfo', shareInfoSchema);

module.exports = ShareInfo;
