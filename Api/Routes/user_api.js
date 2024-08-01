const express =require("express");
const router=express.Router();
const mongoose=require('mongoose');
const User=require('../Routes/Model/user_model')
const ShareInfo = require('../Routes/Model/share-info');
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
        registrationDate:user.registrationDate,
        subscriptionType:user.subscriptionType,
        profession: user.profession,
        organization: user.organization,
        userImage: user.userImage,
        isActive: user.isActive,
        isEnabledLostMode:user.isLost,
        lostMassege:user.lostMassege,
        directMode:user.userDirectMode,
        TagActivated:user.TagActivated,
        isSHareByCatgOn:user.isSHareByCatgOn,
        isChoosedCatgBtnOptions:user.isChoosedCatgBtnOptions,
        selectedCatgBtnOptionValue:user.selectedCatgBtnOptionValue,
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
      registrationDate:new Date(),
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profession: req.body.profession,
      organization: req.body.organization,
      userImage: req.body.userImage,
      isActive: req.body.isActive,
      TagActivated:false,
      isLost:req.bodyisLost,
      isSHareByCatgOn:false,
      isChoosedCatgBtnOptions:false,
      lostMassege:req.body.lostMassege,
      isChoosedCatgBtnOptions:true,
      subscriptionType:"pro",
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

    // Check if the device token already exists in the array
    if (user.deviceToken.includes(deviceToken)) {
      return res.status(400).json({ error: 'Device token already exists' });
    }

    // Add the new device token to the array
    user.deviceToken.push(deviceToken);

    // If there are more than 4 device tokens, remove the oldest one
    if (user.deviceToken.length > 1) {
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
router.put('/updatesharebycategoreyoption/:userId', async (req, res) => {
  
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
router.post('/isSHareByCatgOn/:userId', async (req, res) => {
  const { userId } = req.params;
  const { isSHareByCatgOn } = req.body;
console.log(isSHareByCatgOn)
  try {
    // Find the user by ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the userSharebyGategorey field
    user.isSHareByCatgOn = isSHareByCatgOn;

    // Save the updated user object
    await user.save();

    return res.status(200).json({ message: 'User share by category updated successfully' });
  } catch (error) {
    console.error('Error updating user share by category:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/share-by-categorey-update/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user document based on the provided user ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Capture the values you want along with the timestamp of the last modification
    const userData = {
      isSHareByCatgOn: user.isSHareByCatgOn,
      selectedCatgBtnOptionValue: user.selectedCatgBtnOptionValue,
      isChoosedCatgBtnOptions: user.isChoosedCatgBtnOptions
    };

    // Return the retrieved data along with the timestamp
    res.json(userData);
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



router.post('/TagActivated/:userId', async (req, res) => {
  const { userId } = req.params;
  const { TagActivated } = req.body;
console.log(TagActivated)
  try {
    // Find the user by ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the userSharebyGategorey field
    user.TagActivated = TagActivated;

    // Save the updated user object
    await user.save();

    return res.status(200).json({ message: 'User share Purchased category updated successfully' });
  } catch (error) {
    console.error('Error updating user Purchased category:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

//share user information
router.get('/contact-info/leadcapture/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
   
    
    // Check if the userId exists in Users collection based on custom 'id' field
    const existingUser = await User.findOne({ id: userId });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch all share info related to the user
    const shareInfos = await ShareInfo.find({ userId: existingUser._id });

    return res.status(200).json({ data: shareInfos });
  } catch (error) {
    console.error('Error fetching share info:', error);
    return res.status(500).json({ message: 'Error fetching share info', error });
  }
});
 
router.post('/user-info/share',async (req, res) => {
  try {
    const {
      userId,  // This should be the custom 'id' field, not the MongoDB '_id'
      email,
      name,
      phone,
      jobTitle,
      company,
      notes
    } = req.body;
 
    // Check if the userId exists in Users collection based on custom 'id' field
    const existingUser = await User.findOne({ id: userId });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create new ShareInfo document
    const shareInfo = new ShareInfo({
      userId: existingUser._id,  // Link to the internal MongoDB _id of the User
      email,
      name,
      phone,
      jobTitle,
      company,
      notes
    });

    // Save ShareInfo document
    const savedShareInfo = await shareInfo.save();

    return res.status(201).json({ message: "Information Save Success", data: savedShareInfo });
  } catch (error) {
    console.error('Error saving share info:', error);
    return res.status(500).json({ message: 'Error saving share info', error });
  }
});
router.put('/user-info/leadcapture-update/:id', async (req, res) => {
  try {
    const shareInfoId = req.params.id;
    const {
      email,
      name,
      phone,
      jobTitle,
      company,
      notes
    } = req.body;

    // Find the ShareInfo document by ID and update it
    const updatedShareInfo = await ShareInfo.findByIdAndUpdate(
      shareInfoId,
      {
        email,
        name,
        phone,
        jobTitle,
        company,
        notes
      },
      { new: true } // Return the updated document
    );

    if (!updatedShareInfo) {
      return res.status(404).json({ error: 'Shared contact info not found' });
    }

    return res.status(200).json({ message: 'Information update success', data: updatedShareInfo });
  } catch (error) {
    console.error('Error updating share info:', error);
    return res.status(500).json({ message: 'Error updating share info', error });
  }
});
router.delete('/user-info/leadcapture-delete/:id', async (req, res) => {
  try {
    const shareInfoId = req.params.id;

    // Find the ShareInfo document by ID and delete it
    const deletedShareInfo = await ShareInfo.findByIdAndDelete(shareInfoId);

    if (!deletedShareInfo) {
      return res.status(404).json({ error: 'Shared contact info not found' });
    }

    return res.status(200).json({ message: 'Information delete success' });
  } catch (error) {
    console.error('Error deleting share info:', error);
    return res.status(500).json({ message: 'Error deleting share info', error });
  }
});


module.exports = router; 