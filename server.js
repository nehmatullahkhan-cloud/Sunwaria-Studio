const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Connecting to the 'namaz_timing' database as requested
const MONGO_URI = "mongodb+srv://nehmatullah:1122@learn.usn1zoo.mongodb.net/namaz_timing?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected to 'namaz_timing'"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Define Schema matching the Typescript interfaces
const TimingSchema = new mongoose.Schema({
  id: Number,
  date: String,
  day_en: String,
  day_ur: String,
  sehri: String,
  iftar: String,
  hijri_date: Number
});

const LocationSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name_en: String,
  name_ur: String,
  timings: [TimingSchema]
});

const LocationModel = mongoose.model('Location', LocationSchema);

// API Routes

// GET: Fetch all location data for the App
app.get('/api/locations', async (req, res) => {
  try {
    const data = await LocationModel.find({}, '-_id -__v -timings._id');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST: Update location data (Admin Only)
app.post('/api/locations', async (req, res) => {
  const { password, data } = req.body;
  
  // Simple password check matching the client constant
  if (password !== 'AhsaanGlobal786') {
    return res.status(403).json({ error: "Unauthorized: Wrong Admin Password" });
  }
  
  if (!Array.isArray(data)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  try {
    // Upsert (Update or Insert) each location
    for (const loc of data) {
      await LocationModel.findOneAndUpdate(
        { id: loc.id }, 
        loc, 
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    
    // Optional: Delete locations not in the payload if you want strict syncing
    // const ids = data.map(l => l.id);
    // await LocationModel.deleteMany({ id: { $nin: ids } });

    console.log("✅ Data synced to MongoDB by Admin");
    res.json({ success: true, message: "Data saved to MongoDB" });
  } catch (e) {
    console.error("Save Error:", e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));