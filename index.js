const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const qrcode = require("qrcode-terminal");
const multer = require("multer");
// const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const upload = multer({
  dest: "./uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.originalname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("dotenv").config();

const dbHost = process.env.MONGO_DB;
const port = 5000 || process.env.PORT;

const { Client, MessageMedia, LocalAuth } = require("whatsapp-web.js");

const client = new Client({
  authStrategy: new LocalAuth(), puppeteer: {args: ['--no-sandbox']}
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes
// app.use("/uploads", express.static("uploads"));
// app.use(express.static(__dirname, '/client/build'));
app.use(express.static(path.join(__dirname)));

app.use(
  cors()
);


// Connect to your MongoDB database
mongoose
  .connect(dbHost, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"));

// Define the WhatsAppNumber schema
const whatsappNumberSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
  },
});

// Create the WhatsAppNumber model
const WhatsAppNumber = mongoose.model("WhatsAppNumber", whatsappNumberSchema);

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  img: {
    type: String,
  },
  imgURL:{
    type: String
  }
});

const Message = mongoose.model("Message", messageSchema);


const postSchema = new mongoose.Schema({
  myFile: String
});

const Post = mongoose.model("Post", postSchema);


client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("QR RECEIVED", qr);
});

let arr = [];

app.get("/", (req, res) => {
  try{
    res.send("Server is running");
  } catch(error){
    console.log(error);
  }
});

client.on("ready", () => {
  console.log("Client is ready!");

  //send the message to all the numbers
  app.post("/api/sendtoall", async (req, res) => {
    const numbers = await WhatsAppNumber.find({}, { number: 1, _id: 0 });
    const numberArray = numbers.map((number) => number.number);
    const data = await Message.find({}).exec();
    const message = data[0].message;
    const imageUrl = data[0].imgURL;
    // console.log(imageUrl, "imageurl")
    // const imageBuffer = fs.readFileSync(imageUrl);

    // console.log(imageBuffer, "imagebuffer");
    // const imageBase64 = imageBuffer.toString("base64");
    // const data = message[0].message;
    numberArray.map((item) => sendDirectMessage(item, imageUrl, message));
  });

  //customer input
  app.post("/api/saveWhatsappNumber", async (req, res) => {
    const { whatsappNumber } = req.body;
    arr.push(`91${whatsappNumber}@c.us`);
    // console.log(arr, "heelooo");

    try {
      // Check if the number already exists in the database

      const existingNumber = await WhatsAppNumber.findOne({
        number: `91${whatsappNumber}@c.us`,
      });
      const message = await Message.find({}).exec();
      const data = message[0].message;
      const imageUrl = message[0].imgURL;
      console.log(typeof(imageUrl), "imageurl")
      // const imageBuffer = fs.readFileSync(imageUrl);
      // const imageBase64 = imageBuffer.toString("base64");
      if (existingNumber) {
        // console.log(arr);
        sendDirectMessage(arr[0], imageUrl, data);
        arr = [];
        // Number already exists, return response indicating existing membership
        return res.json({ isExistingMember: true });
      }else{
        // Number is new, save it to the database
        await WhatsAppNumber.create({ number: `91${whatsappNumber}@c.us` });
        sendDirectMessage(arr[0], imageUrl, data);
        arr = [];
  
        // Return success response
        return res.json({ isExistingMember: false });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "An error occurred" });
    }
  });
});

// let message = '';
//send the old inputs to the user
app.get("/api/akshay2", async (req, res) => {
  try {
    const message = await Message.find({}).exec();
    const data = { message: message[0].message, img: message[0].imgURL };
    res.json(data);
  } catch (error) {
    console.log(error);
  }
});

//save the user input
app.post("/api/akshay", upload.single("image"), async (req, res) => {
  try {
    const msg = req.body.message;
    const imageUrl = path.join(__dirname, "uploads", req.file.filename);
    const imgURL = req.file;
    
    // console.log(imgURL, "imgurl")
    const base64 = fs.readFileSync(imageUrl, "base64");
    console.log(base64, "imgurl");
    const dbmsg = await Message.find({}).exec();
    if (dbmsg.length > 0) {
      await Message.deleteMany({});
      await Message.create({ message: msg, img: imageUrl, imgURL: base64 });
      const reply = {submitted: true}
      res.json(reply);
    } else {
      await Message.create({ message: msg, img: imageUrl, imgURL: base64 });
    }
  } catch (error) {
    console.log(error);
  }
});

// API route for saving the WhatsApp number

async function sendDirectMessage(number, imageUrl, message) {
  try {
    console.log(number);
    const media = new MessageMedia("image/jpeg", imageUrl, "image.jpg");
    await client.sendMessage(number, media, {
      caption: message,
    });
    console.log("Message sent successfully to:", number);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// console.log("reached herer")
client.initialize()

// client.on("auth_failure", (error) => {
//   console.error("Authentication failed:", error);
// });

// client.on("disconnected", (reason) => {
//   console.error("Client disconnected:", reason);
// });


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
