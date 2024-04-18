const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
  socialMediaName: {
    type: String,
    required: false
  },
  socialMediaType: {
    type: String,
    required: false
  },
  socialMediaLink: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    required: false
  },
  socialMediaDirectMode: {
    type: Boolean,
    required: false
  }
});

const userSchema = new mongoose.Schema({
  id:{
    type:String,
    required:false,
    unique:true
  },
  name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false,
    unique: false
  },
  phone: {
    type: String,
    required: false 
  },
  profession: {
    type: String,
    required: false
  },
  organization: {
    type: String,
    required: false
  },
  isLost: {
    type: Boolean,
    required: false
  },
  lostMassege: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    required: false
  },
  userDirectMode: {
    type: Boolean,
    required: false
  },
  userImage: {
    type:String,
  },
  isShareByCatgOn:{
    type: Boolean,
    required: false
  },
  selectedCatgBtnOptionValue: {
    type: String,
    required: false
  },
  isChoosedCatgBtnOptions:{
    type: Boolean,
    required: false
  },
  deviceToken:{
    type: [String],  
  },
  socialMedia: [socialMediaSchema]
}, { timestamps: true });

// Add pre hook to set createdAt timestamp
userSchema.pre('save', function(next) {
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
