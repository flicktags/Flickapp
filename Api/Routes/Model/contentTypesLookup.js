// models/ContentTypesLookup.js
const mongoose = require('mongoose');

const contentTypesLookupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  nameArabic: {
    type: String,
    required: true,
  },
  serial: {
    type: Number,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('ContentTypesLookup', contentTypesLookupSchema);