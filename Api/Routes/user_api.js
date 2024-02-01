const express =require("express");
const router=express.Router();
const mongoose=require('mongoose');
const User=require('../Routes/Model/user_model')

// Middleware to parse JSON
router.use(express.json());

router.get('/:id', async (req, res, next) => {
  const userId = req.params.id;

  try {
    // Find the user by id
    const user = await User.findOne({ id: userId }).populate('socialMedia');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("Fetched user data:", user);

    // Send user details, including social media information
    return res.status(200).json({
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        profession: user.profession,
        organization: user.organization,
        userImage: user.userImage,
        isActive: user.isActive,
        isLost:user.isLost,
        lostMassege:user.lostMassege,
        directMode:user.userDirectMode,
        isChoosedCatgBtnOptions:user.isChoosedCatgBtnOptions,
        deviceToken:user.deviceToken||[],
        socialMedia: user.socialMedia || []
      }
    });
    
  } catch (error) {
    console.error('Error retrieving user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/', async (req, res, next) => {


  try {
    const newUser = new User({
      id:req.body.id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profession: req.body.profession,
      organization: req.body.organization,
      userImage: req.body.userImage,
      isActive: req.body.isActive,
      isLost:req.bodyisLost,
      isChoosedCatgBtnOptions:false,
      lostMassege:req.body.lostMassege,
      socialMedia: req.body.socialMedia || []
    });

    // Save the new user
    const createdUser = await newUser.save();

    console.log("User saved successfully:", createdUser);

    return res.status(201).json({ data: createdUser }); 
  } catch (error) {
    console.error('Error creating user:', error);

    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update user data by user firebase id
router.put('/update/:id', async (req, res, next) => {
  const userId = req.params.id;

  try {
    // Find the user by email
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update only the specified fields
    if (req.body.hasOwnProperty('name')) {
      user.name = req.body.name;
    }

    if (req.body.hasOwnProperty('email')) { 
      user.email = req.body.email;
    }

    if (req.body.hasOwnProperty('phone')) {
      user.phone = req.body.phone;
    }

    if (req.body.hasOwnProperty('profession')) {
      user.profession = req.body.profession;
    }

    if (req.body.hasOwnProperty('organization')) {
      user.organization = req.body.organization;
    }

    if (req.body.hasOwnProperty('userImage')) {
      user.userImage = req.body.userImage;
    }

    if (req.body.hasOwnProperty('isActive')) {
      user.isActive = req.body.isActive;
    }
    if (req.body.hasOwnProperty('isLost')) {
      user.isLost = req.body.isLost;
    }
    if (req.body.hasOwnProperty('lostMassege')) {
      user.lostMassege = req.body.lostMassege;
    }
    // Save the updated user
    const updatedUser = await user.save();

    return res.json({ data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);

    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Middleware to parse JSON
router.delete('/delete/:id', async (req, res, next) => {
  const userId = req.params.id;

  try {
    // Find and delete the user by id
    const deletedUser = await User.findOneAndDelete({ id: userId });

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ data: deletedUser });
  } catch (error) {
    console.error('Error deleting user and social media accounts:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}); 
///device token storing in db
router.post('/devicetoken/:userId', async (req, res) => {
  const { userId } = req.params;
  const { deviceToken } = req.body;

  try {
    // Find the user by ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add the new device token to the array
    user.deviceToken.push(deviceToken);

    // If there are more than 4 device tokens, remove the oldest one
    if (user.deviceToken.length > 4) {
      user.deviceToken.shift(); // Remove the first element (oldest token)
    }

    // Save the updated user object
    await user.save();

    return res.status(200).json({ message: 'Device token added successfully' });
  } catch (error) {
    console.error('Error adding device token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
/// user reponse on push notifcations
router.put('/updatesharebygategorey/:userId', async (req, res) => {
  
  const { userId } = req.params;
  const { isChoosedCatgBtnOptions,selectedCatgBtnOptionValue } = req.body;
console.log(isChoosedCatgBtnOptions)
  try {
    // Find the user by ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the userSharebyGategorey field
    user.isChoosedCatgBtnOptions = isChoosedCatgBtnOptions;
    if(selectedCatgBtnOptionValue!=null) {
    user.selectedCatgBtnOptionValue = selectedCatgBtnOptionValue;
    }
    // Save the updated user object
    await user.save();

    return res.status(200).json({ message: 'User share by category updated successfully' });
  } catch (error) {
    console.error('Error updating user share by category:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


//uset main share by category on and offf status update
router.post('/update-share-by-category/:userId', async (req, res) => {
  const { userId } = req.params;
  const { isChoosedCatgBtnOptions } = req.body;
console.log(isChoosedCatgBtnOptions)
  try {
    // Find the user by ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the userSharebyGategorey field
    user.isChoosedCatgBtnOptions = isChoosedCatgBtnOptions;

    // Save the updated user object
    await user.save();

    return res.status(200).json({ message: 'User share by category updated successfully' });
  } catch (error) {
    console.error('Error updating user share by category:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;
