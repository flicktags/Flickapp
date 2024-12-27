const mongoose = require("mongoose");
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const cors=require('cors');
app.use(cors());
const port = 3000;
const { handleImageUpload, userBannerImage } = require("./Api/Routes/imageupload");
const {handlePdfUpload} = require("./Api/Routes/user_pdf_upload")
const user=require('./Api/Routes/user_api')
const social_media=require('./Api/Routes/social_media')
const userImage = require('./Api/Routes/index');
const flickCode=require('./Api/Routes/flickCodes')
const bodyparser=require('body-parser');
app.use(bodyparser.urlencoded({extended:false})); 
app.use(bodyparser.json());
app.use('/user', user);    
app.use('/socialmedia', social_media);
app.use('/UserImg', userImage);
app.use('/flickCode',flickCode); 
app.use(express.static('public'));
app.post("/UserImg/uploadImage/:id", async (req, res) => { 
  await handleImageUpload(req, res);
});

app.post("/UserPdf/uploadPdf/:id", async (req, res) => {
  console.log('Upload'); 
  await handlePdfUpload(req, res);
}); 
app.post("/UserBanner/Image/:id", async (req, res) => {
  await userBannerImage(req, res);
});
app.use((req, res, next) => { 
  res.status(404).json({
    error: 'Bad Request'  
  });
});
uri = "mongodb+srv://flicktags:fHLfamRWq6Os4jO7@userdata.vevruyz.mongodb.net/?retryWrites=true&w=majority";
async function run() {
  try {
    const connectionString = "mongodb://localhost:27017/test";

    await mongoose.connect(uri, {
      useNewUrlParser: true, 
      useUnifiedTopology: true,
    }).then(data => {
      console.log('data');
    });
  } catch (e) {
    console.log(e);
  }
}

run();
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
