const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const { v2 } = require('cloudinary');
const User = require("./Model/user_model");
const cors = require("cors");

router.use(cors());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Api/Routes/uploads");
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
    const userId = req.params.id;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const pathimg = req.file.path;

    v2.config({
      cloud_name: 'dxyhmgghf',
      api_key: '315569673652811',
      api_secret: '2vWMo0Od99h_maW8P-9DKjc_Neo'
    });

    const result = await v2.uploader.upload(pathimg, { resource_type: "auto" });
    console.log(result.url);

    user.userImage = result.url;
    const usersave = await user.save();

    console.log('usersave', usersave);
    res.send("Image is saved");
  } catch (err) {
    console.error("Error saving image:", err);
    res.status(500).send("Error saving image");
  }
});

router.get("/fetchUserImg/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      UserImage: user.userImage,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
