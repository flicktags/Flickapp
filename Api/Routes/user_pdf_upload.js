// utils/uploadImage.js
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require('streamifier');
const User = require("./Model/user_model");
cloudinary.config({
  cloud_name: 'diwspe6yi',
  api_key: '457834299199625',
  api_secret: 'cOt4I5PxEZ7fPWOI0vmzXYzLt6o',
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

async function handlePdfUpload(req, res) {
  try {
    await runMiddleware(req, res, upload);

    // console.log(req.file.buffer);
    const userId = req.params.id;
    const socialMediaId = req.body.socialMediaId;

    // Find user by ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find social media handle by ID
    const socialMedia = user.socialMedia.id(socialMediaId);

    if (!socialMedia) {
      return res.status(404).json({ error: "Social Media handle not found" });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: "flick-app-userpdf" },
      async (error, result) => {
        if (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          console.log(result.url);

          // Update the user's social media handle with the PDF URL
          socialMedia.userPdf = result.url;

          // Save the updated user object
          await user.save();
          res.status(200).json("PDF saved and social media handle updated");
        }
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = handlePdfUpload;


module.exports = { runMiddleware, handlePdfUpload };

