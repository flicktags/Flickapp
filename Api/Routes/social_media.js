// const router = require("express").Router();
// const User = require("../Routes/Model/user_model");
// router.put("/:id", async (req, res, next) => {
  
  
//     const userId = req.params.id;
  
//     try {
//       // Find the user by email
//       const user = await User.findOne({ id: userId });
  
//       if (!user) {
//         return res.status(404).json({ error: "User not found" });
//       }
  
//       // Add a new social media account to the user's array
//       user.socialMedia.push({
//         socialMediaName: req.body.socialMediaName,
//         socialMediaType: req.body.socialMediaType,
//         socialMediaLink: req.body.socialMediaLink,
//         category: req.body.category,
//         isActive: true,
//       });
  
//       // Save the updated user
//       const updatedUser = await user.save();
  
//       return res.status(200).json({ data: updatedUser });
//     } catch (error) {
//       console.error("Error adding social media account for user:", error);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
// });
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const User = require('../Routes/Model/user_model'); // Adjust the path to your user model

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'diwspe6yi',
  api_key: '457834299199625',
  api_secret: 'cOt4I5PxEZ7fPWOI0vmzXYzLt6o',
  secure: true,
});

// Multer setup for handling file uploads
const upload = multer();

// Utility function to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Function to handle PDF upload
async function uploadPdfToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'flick-app-userpdf' },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
}

// PUT endpoint to create a new social media account and handle optional PDF upload
router.put('/:id', upload.single('file'), async (req, res) => {
  const userId = req.params.id;

  try {
    // Find the user by ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let pdfUrl = null;
    
    // If there's a file (PDF) in the request, handle the PDF upload
    if (req.file) {
      pdfUrl = await uploadPdfToCloudinary(req.file.buffer);
    }

    // Create a new social media account
    const newSocialMedia = {
      socialMediaName: req.body.socialMediaName,
      socialMediaType: req.body.socialMediaType,
      socialMediaLink: req.body.socialMediaLink,
      category: req.body.category,
      isActive: true,
      userPdf: pdfUrl,
    };

    // Add the new social media account to the user's array
    user.socialMedia.push(newSocialMedia);

    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).json({ message: 'Social media account created', data: updatedUser });
  } catch (error) {
    console.error('Error creating social media account for user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





router.delete('/delete/:id/:socialMediaId', async (req, res, next) => {
    const userId = req.params.id;
    const socialMediaId = req.params.socialMediaId;
  
    try {
        const user = await User.findOne({ id: userId });

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        // Find the index of the social media object by socialMediaId
        const socialMediaIndex = user.socialMedia.findIndex(
          (socialMedia) => socialMedia._id.toString() === socialMediaId
        );
    
        if (socialMediaIndex === -1) {
          return res.status(404).json({ error: 'Social media account not found' });
        }
    
  
      // Remove the social media object
      user.socialMedia.splice(socialMediaIndex, 1);
  
      // Save the updated user
      const updatedUser = await user.save();
  
      return res.json({ data: updatedUser });
    } catch (error) {
      console.error('Error deleting social media account for user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.put('/update/:id/:socialMediaId', async (req, res, next) => {
  const userId = req.params.id;
  const socialmediaId = req.params.socialMediaId;
  try {
    // Find the user by id
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the social media object by socialMediaId
    const socialMedia = user.socialMedia.id(socialmediaId);

    if (!socialMedia) {
      return res.status(404).json({ error: 'Social media account not found' });
    }

    // Update only the specified fields
    if (req.body.hasOwnProperty('socialMediaName')) {
      socialMedia.socialMediaName = req.body.socialMediaName;
    }

    if (req.body.hasOwnProperty('socialMediaType')) {
      socialMedia.socialMediaType = req.body.socialMediaType;
    }

    if (req.body.hasOwnProperty('socialMediaLink')) {
      socialMedia.socialMediaLink = req.body.socialMediaLink;
    }

    if (req.body.hasOwnProperty('category')) {
      socialMedia.category = req.body.category;
    }

    if (req.body.hasOwnProperty('isActive')) {
      socialMedia.isActive = req.body.isActive;
    }

    // Save the updated user
    const updatedUser = await user.save();

    return res.json({ data: updatedUser });
  } catch (error) {
    console.error('Error updating social media account for user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
//update DirectMode of user account
// router.put('/updateDirectMode/:UserId', async (req, res) => {
//   try {
//     const userId = req.params.UserId;
//     const { socialMediaId, directMode } = req.body;
//     console.log('userId:', userId);
//     console.log('socialMediaId:', socialMediaId);
    
//     // Convert directMode to boolean (only if needed)
//     const directModeValue = typeof directMode === 'string' ? directMode === 'true' : directMode;

//     console.log('directModeValue:', directModeValue);

//     await User.updateOne({ id: userId }, { $set: { userDirectMode: directModeValue } });
//     await User.updateOne(
//       { id: userId, 'socialMedia._id': socialMediaId },
//       { $set: { 'socialMedia.$.socialMediaDirectMode': directModeValue } }
//     );

//     res.json({ success: true, message: 'Direct mode updated successfully' });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// });
router.put('/updateDirectMode/:UserId', async (req, res) => {
  try {
    const userId = req.params.UserId;
    const { socialMediaId, directMode } = req.body;

    // Convert directMode to boolean
    const directModeValue = typeof directMode === 'string' ? directMode === 'true' : directMode;

    // Update userDirectMode
    await User.updateOne({ id: userId }, { $set: { userDirectMode: directModeValue } });

    // Update social media accounts
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Set socialMediaDirectMode for each social media account
    for (const socialMedia of user.socialMedia) {
      console.log('Comparing:', socialMedia._id.toString(), socialMediaId);
      const updateValue = socialMedia._id.toString() === socialMediaId ? directModeValue : false;
      console.log('Update value:', updateValue);
      await User.updateOne(
        { id: userId, 'socialMedia._id': socialMedia._id },
        { $set: { 'socialMedia.$.socialMediaDirectMode': updateValue } }
      );
    }

    res.json({ success: true, message: 'Direct mode updated successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
//social Media reordering
// router.put('/social_media/re_order', async (req, res) => {
//   try {
//     const { order } = req.body;
    
//     if (!Array.isArray(order)) {
//       return res.status(400).json({ message: 'Invalid order format. It should be an array of social media IDs.' });
//     }

//     const bulkOperations = order.map((id, index) => ({
//       updateOne: {
//         filter: { _id: id },
//         update: { index: index + 1 }
//       }
//     }));

//     // Perform bulkWrite to update all documents efficiently
//     const result = await SocialMedia.bulkWrite(bulkOperations);

//     return res.status(200).json({
//       message: 'Order updated successfully',
//       modifiedCount: result.modifiedCount
//     });
//   } catch (error) {
//     console.error('Error updating order:', error);
//     return res.status(500).json({ message: 'Internal server error', error });
//   }
// });

module.exports = router;
