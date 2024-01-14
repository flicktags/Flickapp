const mongoose = require("mongoose");
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const cors=require('cors');
const port = 3000;
const user=require('./Api/Routes/user_api')
const social_media=require('./Api/Routes/social_media')
const userImage=require('./Api/Routes/index')
const bodyparser=require('body-parser');
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use('/user', user); 
app.use('/socialmedia', social_media);
app.use('/userImage',userImage)
 // Handle 404 - Route Not Found
 const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

 app.use((req, res, next) => { 
  res.status(404).json({
    error: 'Bad Request'
  });
});
 
const uri = "mongodb+srv://mfahimch:78678PPIred@cluster0.eviduti.mongodb.net/?retryWrites=true&w=majority";

 
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
