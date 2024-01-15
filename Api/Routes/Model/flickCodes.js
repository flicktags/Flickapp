const mongoose = require('mongoose');

const flickSeriesSchema = new mongoose.Schema({
  
  flickCode: String,
  flickNumber: String,
  attemptCount: { type: Number, default: 0 },
});

const FlickSeries = mongoose.model('FlickSeries', flickSeriesSchema);

module.exports = FlickSeries;
 