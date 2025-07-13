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
const mongoose = require('mongoose');
const User = require('../Routes/Model/user_model'); // Adjust the path to your user model
const ContentTypesLookup = require('../Routes/Model/contentTypesLookup');


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
      socialMediaNameArabic: req.body.socialMediaNameArabic,
      socialMediaType: req.body.socialMediaType,
      socialMediaLink: req.body.socialMediaLink,
      socialMediaCustomLogo: req.body.socialMediaCustomLogo,
      socialMediaCustomLogoPublicId: req.body.socialMediaCustomLogoPublicId,
      socialMediaCategory: req.body.socialMediaCategory,
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

router.post('/saveContentType', async (req, res) => {
  try {
    const { name, nameArabic, serial, isActive } = req.body;
    const contentType = new ContentTypesLookup({ name, nameArabic, serial, isActive });
    await contentType.save();
    res.status(201).json(contentType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getContentTypesLookup', async (req, res) => {
  try {
    const contentTypes = await ContentTypesLookup.find().sort({ serial: 1 });
    res.json(contentTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete/:userId/:socialMediaId', async (req, res) => {
  const { userId, socialMediaId } = req.params;

  try {
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const socialMediaEntry = user.socialMedia.id(socialMediaId);
    if (!socialMediaEntry) return res.status(404).json({ error: 'Social media not found' });

    // Delete from Cloudinary
    if (socialMediaEntry.socialMediaCustomLogoPublicId) {
      await cloudinary.uploader.destroy(
        socialMediaEntry.socialMediaCustomLogoPublicId,
        { invalidate: true }
      );
    }

    // Delete from database
    user.socialMedia.pull(socialMediaId);
    await user.save();

    return res.json({ success: true });
  } catch (error) {
    console.error('Deletion error:', error);
    return res.status(500).json({ error: 'Deletion failed' });
  }
});


// router.delete('/delete/:id/:socialMediaId', async (req, res) => {
//   const { id: userId, socialMediaId } = req.params;

//   try {
//     const user = await User.findOne({ id: userId });
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const socialMediaEntry = user.socialMedia.id(socialMediaId);
//     if (!socialMediaEntry) return res.status(404).json({ error: 'Social media not found' });

//     // Cloudinary Deletion
//     if (socialMediaEntry.socialMediaLogo?.publicId) {
//       const fullPublicId = socialMediaEntry.socialMediaLogo.publicId;
//       const publicId = fullPublicId.split('/').pop().split('.')[0];
      
//       console.log(`Attempting to delete: ${publicId} (from ${fullPublicId})`);
      
//       await cloudinary.uploader.destroy(publicId, { invalidate: true })
//         .then(result => console.log('Deletion result:', result))
//         .catch(err => console.error('Cloudinary error:', err));
//     }

//     // Database Deletion
//     user.socialMedia.pull(socialMediaId);
//     await user.save();

//     return res.json({ success: true });
//   } catch (error) {
//     console.error('Server error:', error);
//     return res.status(500).json({ error: 'Deletion failed' });
//   }
// });

// router.delete('/delete/:id/:socialMediaId', async (req, res) => {
//   const { id: userId, socialMediaId } = req.params;

//   try {
//     // 1. Find user
//     const user = await User.findOne({ id: userId });
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     // 2. Find the social media entry
//     const socialMediaEntry = user.socialMedia.id(socialMediaId);
//     if (!socialMediaEntry) {
//       return res.status(404).json({ error: 'Social media account not found' });
//     }

//     // 3. Check for logo and delete from Cloudinary
//     if (socialMediaEntry.socialMediaLogo?.publicId) {
//       // Extract JUST the public_id without folder path
//       const publicId = socialMediaEntry.socialMediaLogo.publicId
//         .split('/')
//         .pop() // Gets "emar6ha1rkgbnfkxhu" from "socialMediaCustomLogo-folder/emar6ha1rkgbnfkxhu"
//         .split('.')[0]; // Removes file extension if present
    
//       console.log('Extracted publicId:', publicId);
      
//       await cloudinary.uploader.destroy(publicId, {
//         invalidate: true // Optional: CDN cache invalidation
//       });
//     }

//     if (socialMediaEntry.publicId) {
//       // If public_id exists, delete the old banner image from Cloudinary
//       await cloudinary.uploader.destroy(socialMediaEntry.publicId, (error, result) => {
//         if (error) {
//           console.error('Error deleting old banner image:', error);
//         } else {
//           console.log('Old banner image deleted:', result);
//         }
//       });
//     } else {
//       console.log('No public_id found for banner image, skipping deletion.');
//     }

//     // 4. Remove from database
//     user.socialMedia.pull(socialMediaId);
//     await user.save();

//     return res.json({ success: true });

//   } catch (error) {
//     console.error('Deletion error:', error);
//     return res.status(500).json({ 
//       error: 'Internal Server Error',
//       details: error.message 
//     });
//   }
// });

// router.delete('/delete/:id/:socialMediaId', async (req, res) => {
//   const { id: userId, socialMediaId } = req.params;

//   try {
//     // 1. Find user
//     const user = await User.findOne({ id: userId });
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     // 2. Find the social media index
//     const socialMediaIndex = user.socialMedia.findIndex(
//       (socialMedia) => socialMedia._id.toString() === socialMediaId
//     );
    
//     if (socialMediaIndex === -1) {
//       return res.status(404).json({ error: 'Social media account not found' });
//     }

//     // 3. Check for logo and delete from Cloudinary (using your existing config)
//     const socialMediaEntry = user.socialMedia[socialMediaIndex];
//     if (socialMediaEntry.socialMediaCustomLogo) {
//       try {
//         const publicId = socialMediaEntry.socialMediaCustomLogo
//           .split('/')
//           .pop()
//           .split('.')[0]; // Extract public_id from URL
        
//         await cloudinary.uploader.destroy(publicId);
//         console.log(`Deleted Cloudinary image: ${publicId}`);
//       } catch (cloudinaryError) {
//         console.warn('Cloudinary deletion failed (proceeding anyway):', cloudinaryError);
//       }
//     }

//     // 4. Remove from database
//     user.socialMedia.splice(socialMediaIndex, 1);
//     const updatedUser = await user.save();

//     return res.json({ 
//       success: true,
//       data: updatedUser 
//     });

//   } catch (error) {
//     console.error('Deletion error:', error);
//     return res.status(500).json({ 
//       error: 'Internal Server Error',
//       details: error.message 
//     });
//   }
// });


// router.delete('/delete/:id/:socialMediaId', async (req, res, next) => {
//     const userId = req.params.id;
//     const socialMediaId = req.params.socialMediaId;
  
//     try {
//         const user = await User.findOne({ id: userId });

//         if (!user) {
//           return res.status(404).json({ error: 'User not found' });
//         }
    
//         // Find the index of the social media object by socialMediaId
//         const socialMediaIndex = user.socialMedia.findIndex(
//           (socialMedia) => socialMedia._id.toString() === socialMediaId
//         );
    
//         if (socialMediaIndex === -1) {
//           return res.status(404).json({ error: 'Social media account not found' });
//         }
    
  
//       // Remove the social media object
//       user.socialMedia.splice(socialMediaIndex, 1);
  
//       // Save the updated user
//       const updatedUser = await user.save();
  
//       return res.json({ data: updatedUser });
//     } catch (error) {
//       console.error('Error deleting social media account for user:', error);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });

// Add this to your backend API routes
// New dedicated endpoint for logo replacement
// Define the route in your router file:
router.put('/update-social-media-logo/:id', upload.single('file'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { socialMediaId } = req.body;
    const file = req.file;

    console.log(`Logo update request for user:${userId} socialMedia:${socialMediaId}`);

    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const socialMedia = user.socialMedia.id(socialMediaId);
    if (!socialMedia) {
      console.error('Social media entry not found');
      return res.status(404).json({ error: 'Social media entry not found' });
    }

    if (socialMedia.socialMediaCustomLogoPublicId) {
      await cloudinary.uploader.destroy(socialMedia.socialMediaCustomLogoPublicId);
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "flick-user-socialmedia-customlogo",
          transformation: { width: 512, height: 512, crop: "limit" }
        },
        (error, result) => error ? reject(error) : resolve(result)
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    socialMedia.socialMediaCustomLogo = result.secure_url;
    socialMedia.socialMediaCustomLogoPublicId = result.public_id;
    await user.save();

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
    if (req.body.hasOwnProperty('socialMediaNameArabic')) {
      socialMedia.socialMediaNameArabic = req.body.socialMediaNameArabic;
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
router.put('/social_media/re_order/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { order } = req.body;
     
    // Check if user exists
      const user = await User.findOne({ id: userId });
     
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Validate order format
    if (!Array.isArray(order)) {
      return res.status(400).json({ message: 'Invalid order format. It should be an array of social media IDs.' });
    }
    // Check if all social media IDs belong to the user
      // Check if all social media IDs belong to the user
      const userSocialMediaIds = user.socialMedia.map((media) => media._id.toString());
      console.log('User Social Media IDs:', userSocialMediaIds);
      const invalidIds = order.filter((id) => !userSocialMediaIds.includes(id.toString()));

      // If there are any invalid IDs, return an error
      if (invalidIds.length > 0) {
        return res.status(400).json({
          message: 'Some social media IDs do not belong to the user.',
          invalidIds,
        });
      }


      // Reorder the social media array based on the order received
         const reorderedSocialMedia = order.map((id) => {
           return user.socialMedia.find((media) => media._id.toString() === id.toString());
         });

         // Update the social media order in the user's document
         user.socialMedia = reorderedSocialMedia;

         // Save the updated user document
         await user.save();

         return res.status(200).json({
           message: 'Order updated successfully',
           modifiedCount: 1  // Since you're updating one user document
         });
       } catch (error) {
         console.error('Error updating order:', error);
         return res.status(500).json({ message: 'Internal server error', error });
       }
});

module.exports = router;
