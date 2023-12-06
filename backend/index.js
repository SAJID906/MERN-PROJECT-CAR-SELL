
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcrypt");

const app = express();
const port = 7000;

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/DEVELOPER", { useNewUrlParser: true, useUnifiedTopology: true });

// User model schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// Image model schema
const imageSchema = new mongoose.Schema({
  carModel: String,
  price: Number,
  phoneNumber: String,
  contentType: String,
  data: Buffer,
});

const Image = mongoose.model("Image", imageSchema);

// Multer configuration for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/choose-images', upload.array('images'), async (req, res) => {
  try {
    const { carModel, price, phoneNumber } = req.body;
    const images = req.files.map((file) => ({
      carModel,
      price,
      phoneNumber,
      contentType: file.mimetype,
      data: file.buffer,
    }));

    await Image.insertMany(images);
    res.status(201).json({ message: 'Images and car information saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error choosing images and saving car information' });
  }
});

const fetchChosenImages = async (req, res) => {
  try {
    const images = await Image.find();
    const transformedImages = images.map((image) => ({
      ...image._doc,
      data: image.data.toString('base64'),
    }));
    res.status(200).json({ chosenImages: transformedImages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching chosen images' });
  }
};

app.get('/api/get-images', fetchChosenImages);

app.delete('/api/delete-image/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    await Image.findByIdAndDelete(imageId);
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting image' });
  }
});

// Signup endpoint
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    console.error('Error during signup:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

