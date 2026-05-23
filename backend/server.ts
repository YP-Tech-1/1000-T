import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";

// Route Imports
import choristerRoutes from "./routes/chorister";
import partnershipRoutes from "./routes/partnership";
import volunteerRoutes from "./routes/volunteer";
import galleryRoutes from "./routes/gallery";
import newsletterRoutes from "./routes/newsletter";

const app = express();

// --- MONGODB CONNECTION SETUP ---
const uri = process.env.MONGODB_URI;
if (!uri) console.error("Warning: MONGODB_URI is not defined in .env");

// VERCEL FIX: Provide a properly formatted fallback string so it doesn't crash on boot
const client = new MongoClient(uri || "mongodb://localhost:27017");

// --- MANUAL CORS HEADERS (The "Nuclear" Option) ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  next();
});

app.use(cors()); 
app.use(bodyParser.json());

// Register routes
app.use("/api", choristerRoutes);
app.use("/api", partnershipRoutes); 
app.use("/api", volunteerRoutes); 
app.use("/api", galleryRoutes); 
app.use("/api", newsletterRoutes);

// --- REAL-TIME STATISTICS ROUTE ---
app.get("/api/statistics", async (req, res) => {
  try {
    // 1. Connect to the database
    await client.connect();
    const db = client.db("1000t-admin");

    // 2. Count the entries in all three collections
    const choristerCount = await db.collection("choristers").countDocuments();
    const volunteerCount = await db.collection("volunteers").countDocuments();
    const partnershipCount = await db.collection("partnerships").countDocuments();

    // 3. Calculate the grand total
    const totalAttendees = choristerCount + volunteerCount + partnershipCount;

    // 4. Send the data back to the frontend
    res.status(200).json({
      choirVoices: choristerCount,
      expectedAttendees: totalAttendees, 
      registered: choristerCount
    });

  } catch (error) {
    console.error("❌ Error fetching statistics:", error);
    res.status(500).json({ 
      choirVoices: 0,
      expectedAttendees: 0,
      registered: 0
    });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("1000 Tongues Backend is Active");
});

const PORT = process.env.PORT || 5000;

// Only listen locally, Vercel Serverless handles the execution in production
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// CRUCIAL FOR VERCEL
export default app;