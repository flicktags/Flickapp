
const mongoose = require('mongoose');

const flickSeriesSchema = new mongoose.Schema({
  flickCode: String,
  flickNumber: String,
});

const FlickSeries = mongoose.model('FlickSeries', flickSeriesSchema);

module.exports = FlickSeries;
 
