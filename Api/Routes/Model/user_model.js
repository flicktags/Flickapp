const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
  socialMediaName: {
    type: String,
    required: false
  },
index: {
  type: Number,
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
  },
  userPdf: {
    type:String,
  },
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
  subscriptionType:{
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
  userImagePublicId: 
  {type:String},
  userBannerImagePublicId:{
    type:String
  },
  isSHareByCatgOn:{
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
  TagActivated:{
    type: Boolean,
    required: false
  },
    registrationDate: {
    type: Date,
    default: Date.now
  },
  ColorCode:{
    type: String,
    required: false
  },
  userBannerImage:{
    type: String,
    required: false
  },
  subscriptionType: {
    type: String,
    required: false
  },
  subscriptionEndDate: {
    type: Date, 
    required: false
  },
  mainProfileColorCode: {
    type: String,
    required: false // Set to true if it's a required field
  },
  profileBGImage: {
    type: String,
    required: false
  },
  profileStartColor: {
    type: String,
    required: false
  },
  profileEndColor: {
    type: String,
    required: false
  },
  profileTextColor: {
    type: String,
    required: false
  },
  profileContainerColor: {
    type: String,
    required: false
  },

  
 
  socialMedia: [socialMediaSchema]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
