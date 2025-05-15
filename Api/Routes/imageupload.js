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
    // 1. Get userId from JSON body
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    // 2. Validate user exists (but don't store anything)
    const userExists = await User.exists({ id: userId });
    if (!userExists) return res.status(404).json({ error: "User not found" });

    // 3. Process file upload
    await runMiddleware(req, res, upload);
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    // 4. Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          folder: "flick-user-socialmedia-customlogo",
        },
        (error, result) => error ? reject(error) : resolve(result)
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    // 5. Return success
    res.status(200).json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });

  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Upload failed',
      details: error.message 
    });
  }
}



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

