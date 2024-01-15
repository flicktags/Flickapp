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
const upload = multer({ storage: storage });
router.post("/", upload.single("testImage"), (req, res) => {
  const saveImage =  imageModel({
    name: req.body.name,
    img: {
      data: fs.readFileSync("./public/temp/" + req.file.filename),
      contentType: "image/png",
    },
  });
  saveImage  
    .save()
    .then((res) => {
      console.log("image is saved");
    })
    .catch((err) => {
      console.log(err, "error has occur");
    });
    res.send('image is saved')
});


router.put("/:id", upload.single("testImage"), async (req, res) => {
  try {
    // Find the user by the provided id
    const userId = req.params.id;
    console.log("req.params.id:", req.params.id);
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } 
    console.log("User found:", user);
    // Save the image data associated with the user
    const saveImage = user.imageData({
     // Save the user id associated with the image
      name: req.body.name,
      img: { 
        data: fs.readFileSync("./public/temp/" + req.file.filename),
        contentType: "image/png",
      },
    });

    await saveImage.save();
    user.imageData = saveImage._id;  // Assuming 'imageData' is the field in the user schema for the image reference
    await user.save();
    console.log("Image is saved"); 
    res.send("Image is saved");
  } catch (err) {
    console.error("Error saving image:", err);
    res.status(500).send("Error saving image");
  }
});



router.get('/',async (req,res)=>{
  const allData = await imageModel.find()
  res.json(allData)
})

module.exports = router;