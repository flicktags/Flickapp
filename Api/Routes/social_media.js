const router = require("express").Router();
const User = require("../Routes/Model/user_model");
router.put("/:id", async (req, res, next) => {
  
  
    const userId = req.params.id;
  
    try {
      // Find the user by email
      const user = await User.findOne({ id: userId });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Add a new social media account to the user's array
      user.socialMedia.push({
        socialMediaName: req.body.socialMediaName,
        socialMediaType: req.body.socialMediaType,
        socialMediaLink: req.body.socialMediaLink,
        category: req.body.category,
        isActive: req.body.isActive,
      });
  
      // Save the updated user
      const updatedUser = await user.save();
  
      return res.status(200).json({ data: updatedUser });
    } catch (error) {
      console.error("Error adding social media account for user:", error);
      return res.status(500).json({ error: "Internal Server Error" });
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
router.put('/updateDirectMode/:UserId', async (req, res) => {
  try {
    const userId = req.params.UserId;
    const {  socialMediaId, directMode } = req.body;
    console.log(userId, socialMediaId);
    // Convert directMode to boolean
    const directModeValue = directMode === 'true';

    // Update directMode for the specified user
    await User.updateOne({ id: userId }, { $set: { userDirectMode: directModeValue } });

    // Update directMode for the specified social media account
    await User.updateOne(
      { id: userId, 'socialMedia._id': socialMediaId },
      { $set: { 'socialMedia.$.socialMediaDirectMode': directModeValue } }
    );

    res.json({ success: true, message: 'Direct mode updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
module.exports = router;
