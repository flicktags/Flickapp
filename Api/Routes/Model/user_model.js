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
  }
});

const userSchema = new mongoose.Schema({
  id:{
  type:String,
  required:true,
  unique:true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  profession: {
    type: String,
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  userImage: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    required: true
  },
  socialMedia: [socialMediaSchema]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
