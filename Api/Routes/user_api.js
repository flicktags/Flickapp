const express =require("express");
const router=express.Router();
const mongoose=require('mongoose');
const User=require('../Routes/Model/user_model')
const ShareInfo = require('../Routes/Model/share-info');
const ProfileViewStat = require('../Routes/Model/ProfileViewStat');
const Feedback = require('../Routes/Model/feedback');
const SocialMediaViewStat = require('../Routes/Model/socialMediaViewStat');



// Middleware to parse JSON
router.use(express.json());

router.post('/track/profile-view/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the User document by your unique custom id field
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create new ProfileViewStat document referencing User._id
    const profileView = new ProfileViewStat({
      userId: user._id,
      // viewedAt defaults automatically with offset
    });

    const savedView = await profileView.save();

    res.status(201).json({ message: 'Profile view recorded', data: savedView });
  } catch (error) {
    console.error('Error recording profile view:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/fetch-profile-views/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // First find the user by their custom id field
    const existingUser = await User.findOne({ id: userId });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find all profile views using the User._id (ObjectId)
    const profileViews = await ProfileViewStat.find({ 
      userId: existingUser._id 
    }).sort({ viewedAt: -1 }); // newest first

    return res.status(200).json({ 
      data: profileViews,
      count: profileViews.length
    });
  } catch (error) {
    console.error('Error fetching profile views:', error);
    return res.status(500).json({ 
      message: 'Error fetching profile views', 
      error 
    });
  }
});

router.post('/track/social-view/:userId', async (req, res) => {
  const { userId } = req.params;
  const { socialMediaType } = req.body;

  // console.log('[REQUEST]', {
  //   userId,
  //   socialMediaType,
  // });

  if (!socialMediaType) {
    // console.log('[ERROR] socialMediaType missing in request body');
    return res.status(400).json({ error: 'Missing socialMediaType' });
  }

  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      // console.log(`[ERROR] User not found for id: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    const newView = new SocialMediaViewStat({
      userId: user._id,
      socialMediaType,
    });

    const saved = await newView.save();
    // console.log('[SUCCESS] Social media view saved:', saved);

    res.status(201).json({ message: 'Social media view recorded', data: saved });
  } catch (error) {
    // console.error('[EXCEPTION] Failed to track social media view:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/fetch-social-views/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by your custom ID field (not _id)
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Aggregate the stats grouped by socialMediaType
    const stats = await SocialMediaViewStat.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$socialMediaType',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          socialMediaType: '$_id',
          count: 1
        }
      }
    ]);

    res.status(200).json({ data: stats });
  } catch (error) {
    console.error('Error fetching social media view stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//fetch social Media Stats by Date
router.get('/fetch-social-views-by-date/:userId', async (req, res) => {
  const { userId } = req.params;
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: "Missing 'from' or 'to' date in query params." });
  }

  try {
    // Validate and parse dates
    const fromDate = new Date(from);
    const toDate = new Date(to);
toDate.setHours(23, 59, 59, 999); // ✅ Include full day till 23:59:59.999


    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format." });
    }

    // Find the user by custom user id
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Aggregate views in date range grouped by socialMediaType
    const stats = await SocialMediaViewStat.aggregate([
      {
        $match: {
          userId: user._id,
          viewedAt: {
            $gte: fromDate,
            $lte: toDate,
          },
        },
      },
      {
        $group: {
          _id: "$socialMediaType",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          socialMediaType: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json({ data: stats });
  } catch (error) {
    console.error("Error fetching social media views by date:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});





router.post('/submit-feedback/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, feedback, noofStars } = req.body;
    // Validate required fields
    if (!feedback || !noofStars) {
      // console.warn('⚠️ Missing required fields:', { feedback, noofStars });
      return res.status(400).json({ error: 'Feedback and noofStars are required' });
    }

    // Find user by custom user ID (not MongoDB _id)
    const user = await User.findOne({ id: userId });
    if (!user) {
      // console.warn(`❌ User not found for id: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    // console.log('✅ User found:', user._id);

    // Create and save the feedback
    const newFeedback = new Feedback({
      userId: user._id,
      name,
      feedback,
      noofStars
      // submittedAt auto-set
    });

    // console.log('📝 Feedback document to be saved:', newFeedback);

    const savedFeedback = await newFeedback.save();

    // console.log('✅ Feedback saved:', savedFeedback);

    return res.status(201).json({
      message: 'Feedback submitted successfully',
      data: savedFeedback
    });

  } catch (error) {
    // console.error('❌ Error submitting feedback:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/feedbacks/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const feedbacks = await Feedback.find({ userId: user._id }).sort({ submittedAt: -1 });

    return res.status(200).json({ data: feedbacks });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});



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
        id:user._id,
        name: user.name,
        nameArabic: user.nameArabic || null,
        email: user.email,
        phone: user.phone,
        registrationDate:user.registrationDate,
        subscriptionType:user.subscriptionType,
        profession: user.profession,
        professionArabic: user.professionArabic || null,
        organization: user.organization,
        organizationArabic: user.organizationArabic || null,
        userImage: user.userImage,
        isActive: user.isActive,
        isEnabledLostMode:user.isLost,
        lostMassege:user.lostMassege,
        directMode:user.userDirectMode,
        TagActivated:user.TagActivated,
        isMultiLangActivated:user.isMultiLangActivated,
        isSHareByCatgOn:user.isSHareByCatgOn,
        ColorCode:user.ColorCode,
        mainProfileColorCode:user.mainProfileColorCode,
        userBannerImage:user.userBannerImage,
        profileBGImage: user?.profileBGImage || null,
        profileStartColor: user?.profileStartColor || null,
        profileEndColor: user?.profileEndColor || null,
        profileTextColor: user?.profileTextColor || null,
        profileContainerColor: user?.profileContainerColor || null,
        isExchangeContactEnabled: user?.isExchangeContactEnabled,
        subscriptionType:user.subscriptionType,  subscriptionEndDate:user.subscriptionEndDate,
        isChoosedCatgBtnOptions:user.isChoosedCatgBtnOptions,
        selectedCatgBtnOptionValue:user.selectedCatgBtnOptionValue,
        exchangeContactNameEnglish:user.exchangeContactNameEnglish,
        exchangeContactNameArabic:user.exchangeContactNameArabic,
        isContactCardActivated:user.isContactCardActivated,
        isFeedBackEnabled: user.isFeedBackEnabled,
        profileThemeCode: user.profileThemeCode || null,
        deviceToken:user.deviceToken||[],
        socialMedia: user.socialMedia || [],  

      }
    });
    
  } catch (error) {
    console.error('Error retrieving user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.put('/', async (req, res, next) => {
  try {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1); // Set the subscription to expire in one month

    const newUser = new User({
      id: req.body.id,
      registrationDate: new Date(),
      name: req.body.name,
      nameArabic: req.body.nameArabic,
      email: req.body.email,
      phone: req.body.phone,
      profession: req.body.profession,
      professionArabic: req.body.professionArabic,
      organization: req.body.organization,
      organizationArabic: req.body.organizationArabic,
      userImage: req.body.userImage,
      isActive: req.body.isActive,
      TagActivated: false,
      isMultiLangActivated: false,
      isLost: req.body.isLost,
      isSHareByCatgOn: false,
      isChoosedCatgBtnOptions: true,
      lostMassege: req.body.lostMassege,
      subscriptionType: "pro",
      subscriptionEndDate: oneMonthFromNow,
      ColorCode: null,
      mainProfileColorCode: null,
      profileBGImage: null,
      profileStartColor: null,
      profileEndColor: null,
      profileTextColor: null,
      profileContainerColor: null,
      userBannerImage: null, 
      isExchangeContactEnabled: true,
      exchangeContactNameEnglish: null,
      exchangeContactNameArabic: null,
      isExchangeContactEnabled: false,
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

// router.put('/', async (req, res, next) => {
//   try {
//     const oneMonthFromNow = new Date();
//     oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1); // Set the subscription to expire in one month

//     const newUser = new User({
//       id: req.body.id,
//       registrationDate: new Date(),
//       name: req.body.name,
//       email: req.body.email,
//       phone: req.body.phone,
//       profession: req.body.profession,
//       organization: req.body.organization,
//       userImage: req.body.userImage,
//       isActive: req.body.isActive,
//       TagActivated: false,
//       isLost: req.body.isLost,
//       isSHareByCatgOn: false,
//       isChoosedCatgBtnOptions: true,
//       lostMassege: req.body.lostMassege,
//       subscriptionType: "trial", // Set the subscription type to "trial"
//       subscriptionEndDate: oneMonthFromNow, // Set the free trial end date to one month from now
//       ColorCode: null,
//       userBannerImage: null, 
//       socialMedia: req.body.socialMedia || []
//     });

//     // Save the new user
//     const createdUser = await newUser.save();
//     console.log("User saved successfully:", createdUser);

//     return res.status(201).json({ data: createdUser }); 
//   } catch (error) {
//     console.error('Error creating user:', error);

//     // Handle specific validation errors
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ error: 'Validation Error', details: error.errors });
//     }

//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

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
    if (req.body.hasOwnProperty('nameArabic')) {
      user.nameArabic = req.body.nameArabic;
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

    if (req.body.hasOwnProperty('professionArabic')) {
      user.professionArabic = req.body.professionArabic;
    }

    if (req.body.hasOwnProperty('organization')) {
      user.organization = req.body.organization;
    }

    if (req.body.hasOwnProperty('organizationArabic')) {
      user.organizationArabic = req.body.organizationArabic;
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

    if (req.body.hasOwnProperty('profileBGImage')) {
      user.profileBGImage = req.body.profileBGImage;
    }
    if (req.body.hasOwnProperty('isExchangeContactEnabled')) {
      user.isExchangeContactEnabled = req.body.isExchangeContactEnabled;
    }
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

// router.post('/MultiLangActivated/:userId', async (req, res) => {
//   const { userId } = req.params;
//   const { MultiLangActivated } = req.body;
// console.log(MultiLangActivated)
//   try {
//     // Find the user by ID
//     const user = await User.findOne({ id: userId });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Update the userSharebyGategorey field
//     user.MultiLangActivated = MultiLangActivated;

//     // Save the updated user object
//     await user.save();

//     return res.status(200).json({ message: 'Multi Language has been enabled successfully' });
//   } catch (error) {
//     console.error('Error updating user Purchased category:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

router.post('/MultiLangActivated/:userId', async (req, res) => {
  const { userId } = req.params;
  const { isMultiLangActivated } = req.body;
  
  console.log(`Setting MultiLangActivated to ${isMultiLangActivated} for user ${userId}`);

  try {
    // Find the user by ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize field if it doesn't exist
    if (user.isMultiLangActivated === undefined) {
      console.log('MultiLangActivated field not found - initializing');
      user.isMultiLangActivated = false; // Default value
    }

    // Convert input to boolean if needed
    const newValue = typeof isMultiLangActivated === 'boolean' 
      ? isMultiLangActivated 
      : isMultiLangActivated === 'true';

    // Update the field
    user.isMultiLangActivated = newValue;

    // Save the updated user
    await user.save();

    console.log(`Successfully set MultiLangActivated to ${user.isMultiLangActivated} for user ${userId}`);
    
    return res.status(200).json({ 
      success: true,
      message: 'Multi Language status updated successfully',
      isMultiLangActivated: user.isMultiLangActivated
    });
  } catch (error) {
    console.error('Error updating Multi Language status:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    });
  }
});


router.post('/ContactCardActivated/:userId', async (req, res) => {
  const { userId } = req.params;
  const { isContactCardActivated } = req.body;
  
  console.log(`Setting ContactCard to ${isContactCardActivated} for user ${userId}`);

  try {
    // Find the user by ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize field if it doesn't exist
    if (user.isContactCardActivated === undefined) {
      console.log('isContactCardActivated field not found - initializing');
      user.isContactCardActivated = false; // Default value
    }

    // Convert input to boolean if needed
    const newValue = typeof isContactCardActivated === 'boolean' 
      ? isContactCardActivated 
      : isContactCardActivated === 'true';

    // Update the field
    user.isContactCardActivated = newValue;

    // Save the updated user
    await user.save();

    console.log(`Successfully set MultiLangActivated to ${user.isContactCardActivated} for user ${userId}`);
    
    return res.status(200).json({ 
      success: true,
      message: 'Contact Card status updated successfully',
      isContactCardActivated: user.isContactCardActivated
    });
  } catch (error) {
    console.error('Error updating Contact Card status:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    });
  }
});

router.post('/feedbackEnabled/:userId', async (req, res) => {
  const { userId } = req.params;
  const { isFeedBackEnabled } = req.body;
  
  console.log(`Setting isFeedBackEnabled to ${isFeedBackEnabled} for user ${userId}`);

  try {
    // Find the user by ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize field if it doesn't exist
    if (user.isFeedBackEnabled === undefined) {
      console.log('isFeedBackEnabled field not found - initializing');
      user.isFeedBackEnabled = false; // Default value
    }

    // Convert input to boolean if needed
    const newValue = typeof isFeedBackEnabled === 'boolean' 
      ? isFeedBackEnabled 
      : isFeedBackEnabled === 'true';

    // Update the field
    user.isFeedBackEnabled = newValue;

    // Save the updated user
    await user.save();

    console.log(`Successfully set isFeedBackEnabled to ${user.isFeedBackEnabled} for user ${userId}`);
    
    return res.status(200).json({ 
      success: true,
      message: 'FeedBack status updated successfully',
      isFeedBackEnabled: user.isFeedBackEnabled
    });
  } catch (error) {
    console.error('Error updating FeedBack status:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    });
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
router.post('/color-codes/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { colorCode, mainProfileColorCode, profileStartColor, profileEndColor, profileContainerColor, profileTextColor } = req.body;  // Extract colorCode from the request body

    // Find the user document based on the provided user ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.ColorCode = colorCode;
    user.mainProfileColorCode = mainProfileColorCode || null;
    user.profileStartColor = profileStartColor || null;
    user.profileEndColor = profileEndColor || null;
    user.profileContainerColor = profileContainerColor || null;
    user.profileTextColor = profileTextColor || null;

    await user.save();

    res.status(200).json({ message: 'Color code saved successfully' });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/exchangeContactNaming/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { exchangeContactNameEnglish, exchangeContactNameArabic} = req.body;  // Extract colorCode from the request body

    // Find the user document based on the provided user ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.exchangeContactNameEnglish = exchangeContactNameEnglish || null;
    user.exchangeContactNameArabic = exchangeContactNameArabic || null;
    await user.save();

    res.status(200).json({ message: 'Exchange Contact name saved successfully' });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/saveProfileTheme/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { profileThemeCode} = req.body;  // Extract colorCode from the request body

    // Find the user document based on the provided user ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profileThemeCode = profileThemeCode || null;
    await user.save();

    res.status(200).json({ message: 'Profile Theme updated successfully' });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ message: 'Server error' });
  }
});
// API to update subscription plan
// router.post('/updateSubscription/:userId', async (req, res) => {
//   const userId = req.params.userId;  // Extract userId from the request parameters
//   const { subscriptionPlan } = req.body;

//   try {
//     // Calculate subscription end date and determine subscription type
//     let subscriptionEndDate;
//     let subscriptionType;
//     const currentDate = new Date();

//     switch (subscriptionPlan) {
//       case "1":
//         subscriptionEndDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
//         subscriptionType = "pro";
//         break;
//       case "2":
//         subscriptionEndDate = new Date(currentDate.setMonth(currentDate.getMonth() + 6));
//         subscriptionType = "pro";
//         break;
//       case "3":
//         subscriptionEndDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
//         subscriptionType = "pro";
//         break;
//       case "4":
//         subscriptionEndDate = currentDate; // Basic subscription, no additional time
//         subscriptionType = "basic";
//         break;
//       default:
//         return res.status(400).json({ message: "Invalid subscription plan" });
//     }

//     // Update user with the new subscription end date and subscription type
//     const user = await User.findOneAndUpdate(
//       { id: userId },
//       { subscriptionType: subscriptionType, subscriptionEndDate: subscriptionEndDate },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({ message: "Subscription updated successfully", user });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });
router.post('/updateSubscription/:userId', async (req, res) => {
  const userId = req.params.userId;  // Extract userId from the request parameters
  const { subscriptionPlan } = req.body;

  try {
    // Find the user to get their current subscription details
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate remaining time from the current subscription if any
    let currentDate = new Date();
    let remainingTime = 0;

    if (user.subscriptionEndDate && user.subscriptionEndDate > currentDate) {
      remainingTime = user.subscriptionEndDate - currentDate; // Time remaining in milliseconds
    }

    // Calculate new subscription end date based on the new plan and remaining time
    let subscriptionEndDate;
    let subscriptionType;
    
    switch (subscriptionPlan) {
      case "1":
        subscriptionEndDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1) + remainingTime);
        subscriptionType = "pro";
        break;
      case "2":
        subscriptionEndDate = new Date(currentDate.setMonth(currentDate.getMonth() + 6) + remainingTime);
        subscriptionType = "pro";
        break;
      case "3":
        subscriptionEndDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1) + remainingTime);
        subscriptionType = "pro";
        break;
      case "4":
        // subscriptionEndDate = new Date(currentDate.getTime() + remainingTime); // Basic subscription, only add remaining time
        subscriptionEndDate = user.subscriptionEndDate;
        subscriptionType = "basic";
        break;
      default:
        return res.status(400).json({ message: "Invalid subscription plan" });
    }

    // Update user with the new subscription end date and subscription type
    user.subscriptionType = subscriptionType;
    user.subscriptionEndDate = subscriptionEndDate;

    await user.save();

    res.json({ message: "Subscription updated successfully", user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router; 
