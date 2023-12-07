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
    required: false
  },
  email: {
    type: String,
    required: false,
    unique: true
  },
  phone: {
    type: Number,
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
  userImage: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    required: false
  },
  socialMedia: [socialMediaSchema]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
