const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const User = require("./Model/user_model");
app.use(cors());
const router = require("express").Router();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only PNG and JPG files
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG and PNG files are allowed"), false);
  }
};
 
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 3 * 1024 * 1024, // Limit file size to 3MB
  },
  fileFilter: fileFilter,
});
router.put("/uploadUserImg/:id", upload.single("testImage"), async (req, res) => {
  try {
    // Find the user by the provided id
    const userId = req.params.id;
    console.log("req.params.id:", req.params.id);
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } 
    console.log("req.file:", req.file);

    // Save the image data associated with the user
    const saveImage = {
      name: req.body.name,
      img: {
        data: fs.readFileSync("./public/temp/" + req.file.filename),
        contentType: "image/png",
      },
    };
     
    // Update the user's imageData field with the saved image data
    user.imageData = saveImage;
    
    await user.save();
    console.log("Image is saved"); 
    res.send("Image is saved");
  } catch (err) { 
    console.error("Error saving image:", err);
    res.status(500).send("Error saving image");
  }
});
router.get("/fetchUserImg/:id", async (req, res) => {
  try {
    const userId = req.params.id;
 
    // Find the user by the provided id
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Respond with user information including image data
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      // ... other user properties
      imageData: {
        name: user.imageData.name,
        contentType: user.imageData.img.contentType,
        data: user.imageData.img.data.toString("base64"), // Convert binary data to base64
      },
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;