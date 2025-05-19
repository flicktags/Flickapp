// utils/uploadImage.js
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require('streamifier');
const User = require("./Model/user_model");
cloudinary.config({
  cloud_name: 'dxyhmgghf',
  api_key: '315569673652811',
  api_secret: '2vWMo0Od99h_maW8P-9DKjc_Neo',
  secure: true,
});

const upload = multer().single("file");

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


async function handleImageUpload(req, res) {
  try {
    await runMiddleware(req, res, upload);

    const userId = req.params.id;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has an existing image and the public_id is available
    if (user.userImagePublicId) {
      // If public_id exists, delete the old image from Cloudinary
      await cloudinary.uploader.destroy(user.userImagePublicId, (error, result) => {
        if (error) {
          console.error('Error deleting old image:', error);
        } else {
          console.log('Old image deleted:', result);
        }
      });
    } else {
      console.log('No public_id found, skipping deletion of old image.');
    }

    // Upload new image
    const stream = cloudinary.uploader.upload_stream(
      { folder: "flick-app-userimage" },
      async (error, result) => {
        if (error) {
          console.error('Error uploading new image:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          console.log('New image uploaded:', result.url);

          // Save new image URL and public_id
          user.userImage = result.url;
          user.userImagePublicId = result.public_id; // Store the new public_id
          await user.save(); 
          res.status(200).json("Image saved");
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handleSMCustomLogoUpload(req, res) {
  try {
    console.log('\n--- New upload request received ---'); // Debug log
    await runMiddleware(req, res, upload);
    
    const { userId } = req.body;

    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: "flick-user-socialmedia-customlogo",
        transformation: { width: 512, height: 512, crop: "limit" },
        use_filename: true,
        unique_filename: true
      },
      async (error, result) => {
        
        if (error) {
          console.error('Cloudinary error:', error);
          return res.status(500).json({ error: 'Upload failed' });
        }

        if (!result.public_id) {
          console.error('Missing public_id in result! Full result:', result);
        }

        res.status(200).json({ 
          success: true,
          url: result.secure_url,
          publicId: result.public_id // Ensure case matches exactly
        });
      }
    );

    console.log('Starting file upload stream...'); // Debug log
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// async function handleSMCustomLogoUpload(req, res) {
//   try {
//     await runMiddleware(req, res, upload);
//     const { userId, socialMediaId } = req.body; // Add socialMediaId to request body
//     const user = await User.findOne({ id: userId });

//     if (!user) return res.status(404).json({ error: "User not found" });

//     // Find or create social media entry
//     let socialMediaEntry = user.socialMedia.id(socialMediaId) || 
//       user.socialMedia.create({ _id: new mongoose.Types.ObjectId() });

//     const uploadStream = cloudinary.uploader.upload_stream(
//       { 
//         folder: "flick-user-socialmedia-customlogo",
//         transformation: { width: 512, height: 512, crop: "limit" } 
//       },
//       async (error, result) => {
//         if (error) {
//           console.error('Upload error:', error);
//           return res.status(500).json({ error: 'Upload failed' });
//         }

//         // Update the SPECIFIC social media entry
//         socialMediaEntry.socialMediaCustomLogo = result.secure_url;
//         socialMediaEntry.socialMediaCustomLogoPublicId = result.public_id;
        
//         if (!user.socialMedia.includes(socialMediaEntry)) {
//           user.socialMedia.push(socialMediaEntry);
//         }

//         await user.save();

//         res.status(200).json({ 
//           success: true,
//           url: result.secure_url,
//           publicId: result.public_id,
//           storedPublicId: socialMediaEntry.socialMediaCustomLogoPublicId,
//           databaseMatch: socialMediaEntry.socialMediaCustomLogoPublicId === result.public_id
//         });
//       }
//     );

//     streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

//   } catch (error) {
//     console.error('Server error:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }

// async function handleSMCustomLogoUpload(req, res) {
//   try {
//     await runMiddleware(req, res, upload);

//     const { userId } = req.body; // Get userId from request body instead of params
//     const user = await User.findOne({ id: userId });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     // Upload new logo (without deleting any existing ones)
//     const uploadStream = cloudinary.uploader.upload_stream(
//       { 
//         folder: "flick-user-socialmedia-customlogo",
//         transformation: { width: 512, height: 512, crop: "limit" } 
//       },
//       async (error, result) => {
//         if (error) {
//           console.error('Upload error:', error);
//           return res.status(500).json({ error: 'Upload failed' });
//         }

//         // Save logo reference to user document
//         // user.socialMediaLogo = {
//         //   url: result.secure_url,
//         //   publicId: result.public_id,
//         //   uploadedAt: new Date()
//         // };

//         user.socialMediaCustomLogo = result.secure_url;
//         user.socialMediaCustomLogoPublicId = result.public_id;
        
//         // await user.save();
//         // res.status(200).json({ 
//         //   success: true,
//         //   url: result.secure_url 
//         // });
//         await user.save();
//         res.status(200).json({ 
//           success: true,
//           url: result.secure_url,
//           publicId: result.public_id,
//           socialMediaCustomLogoPublicId: publicId
//         });
//       }
//     );

//     streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

//   } catch (error) {
//     console.error('Server error:', error);
//     res.status(500).json({ 
//       error: 'Internal Server Error',
//       details: error.message 
//     });
//   }
// }

async function userBannerImage(req, res) {
  try {
    await runMiddleware(req, res, upload);

    const userId = req.params.id;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has an existing banner image and the public_id is available
    if (user.userBannerImagePublicId) {
      // If public_id exists, delete the old banner image from Cloudinary
      await cloudinary.uploader.destroy(user.userBannerImagePublicId, (error, result) => {
        if (error) {
          console.error('Error deleting old banner image:', error);
        } else {
          console.log('Old banner image deleted:', result);
        }
      });
    } else {
      console.log('No public_id found for banner image, skipping deletion.');
    }

    // Upload new banner image
    const stream = cloudinary.uploader.upload_stream(
      { folder: "flick-app-userimage" },
      async (error, result) => {
        if (error) {
          console.error('Error uploading new banner image:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          console.log('New banner image uploaded:', result.url);

          // Save new banner image URL and public_id
          user.userBannerImage = result.url;
          user.userBannerImagePublicId = result.public_id; // Store the new public_id for the banner image
          await user.save();
          
          res.status(200).json("User Banner Image saved");
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handleProfileImageUpload(req, res) {
  try {
    await runMiddleware(req, res, upload);

    const userId = req.params.id;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has an existing image and the public_id is available
    if (user.userProfileImagePublicId) {
      // If public_id exists, delete the old image from Cloudinary
      await cloudinary.uploader.destroy(user.userProfileImagePublicId, (error, result) => {
        if (error) {
          console.error('Error deleting old image:', error);
        } else {
          console.log('Old image deleted:', result);
        }
      });
    } else {
      console.log('No public_id found, skipping deletion of old image.');
    }

    // Upload new image
    const stream = cloudinary.uploader.upload_stream(
      { folder: "flick-user-profile-background" },
      async (error, result) => {
        if (error) {
          console.error('Error uploading new image:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          console.log('New image uploaded:', result.url);

          // Save new image URL and public_id
          user.profileBGImage = result.url;
          user.userProfileImagePublicId = result.public_id; // Store the new public_id
          await user.save();
          
          res.status(200).json("Image saved");
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function userProfileBackgroundImage(req, res) {
  try {
    await runMiddleware(req, res, upload);

    const userId = req.params.id;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has an existing banner image and the public_id is available
    if (user.userProfileBackgroundImagePublicId) {
      // If public_id exists, delete the old banner image from Cloudinary
      await cloudinary.uploader.destroy(user.userProfileBackgroundImagePublicId, (error, result) => {
        if (error) {
          console.error('Error deleting old banner image:', error);
        } else {
          console.log('Old banner image deleted:', result);
        }
      });
    } else {
      console.log('No public_id found for banner image, skipping deletion.');
    }

    // Upload new banner image
    const stream = cloudinary.uploader.upload_stream(
      { folder: "flick-user-profile-background" },
      async (error, result) => {
        if (error) {
          console.error('Error uploading new banner image:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          console.log('New Profile Background image uploaded:', result.url);

          // Save new banner image URL and public_id
          user.profileBGImage = result.url;
          user.userProfileBackgroundImagePublicId = result.public_id; // Store the new public_id for the banner image
          await user.save();
          
          res.status(200).json("User Profile Background Image saved");
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}



module.exports = { runMiddleware, handleImageUpload, handleSMCustomLogoUpload, userBannerImage, handleProfileImageUpload, userProfileBackgroundImage };

