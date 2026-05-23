import { Router } from "express";
import { MongoClient } from "mongodb";

const router = Router();

const uri = process.env.MONGODB_URI;
if (!uri) console.error("Warning: MONGODB_URI is not defined in .env");

// VERCEL FIX: Added fallback string to prevent crash
const client = new MongoClient(uri || "mongodb://localhost:27017");

console.log("✅ Volunteer Routes Loaded");

router.post("/volunteer", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("1000t-admin");
    const collection = db.collection("volunteers");
    
    const result = await collection.insertOne({
      ...req.body,
      submittedAt: new Date()
    });

    console.log("✅ Saved Volunteer:", result.insertedId);
    res.status(200).json({ success: true, message: "Saved", id: result.insertedId });
  } catch (err: any) {
    console.error("❌ Volunteer Save Error:", err);
    res.status(500).json({ success: false, message: "Error", error: err.message });
  }
});

router.get("/volunteer", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("1000t-admin");
    const collection = db.collection("volunteers");

    const data = await collection.find({}).sort({ submittedAt: -1 }).toArray();

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch data", error: err.message });
  }
});

export default router;