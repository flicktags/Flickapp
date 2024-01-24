
const FlickSeries = require('../Routes/Model/flickCodes'); // Adjust the path based on your project structure
const router = require("express").Router();
router.get('/',(req, res) => {
return res.status(404).json({error:"the api is not available  for"});

})

router.put('/uploadFlickData', async (req, res) => {
    const flickDataArray = req.body;
  
    if (!Array.isArray(flickDataArray)) {
      return res.status(400).json({ error: 'Invalid request format. Expected an array of flick data.' });
    }
  
    const errors = [];
  
    try { 
      // Use Mongoose's create function to handle bulk insert
      await FlickSeries.create(flickDataArray);
    } catch (error) {
      console.error('Error saving flick data:', error);
      flickDataArray.forEach((flickData) => {
        errors.push({ flickData, error: 'Internal Server Error', details: error.message });
      });
    } 
  
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
  
    res.json({ success: true, message: 'Flick data uploaded successfully' });
  });

  router.post('/verifyFlickCode', async (req, res) => {
    const { flickNumber } = req.body;
  
    if (!flickNumber) {
      return res.status(400).json({ error: 'Flick number is required in the request body' });
    }
  
    try {
      // Find the flick record
      const flickRecord = await FlickSeries.findOne({ flickNumber });
  
      if (flickRecord) {
        // Check the number of attempts
        if (flickRecord.attemptCount < 25) {
          // Increment the attempt count in the database
          await FlickSeries.findByIdAndUpdate(flickRecord._id, { $inc: { attemptCount: 1 } });
  
          return res.json({ exists: true, message: 'Flick Code Exists' });
        } else {
          return res.json({ expired: true, message: 'Flick Code Is Expired' });
        }
      } else {
        return res.json({ exists: false, message: 'Flick data does not exist in the database' });
      }
    } catch (error) {
      console.error('Error verifying flick data:', error);
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });
  
module.exports = router;

