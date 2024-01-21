const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("./Model/user_model");
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
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
