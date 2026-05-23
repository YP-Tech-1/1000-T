import { Router } from "express";
import { MongoClient } from "mongodb";

const router = Router();

const uri = process.env.MONGODB_URI;
if (!uri) console.error("Warning: MONGODB_URI is not defined in .env");

// VERCEL FIX: Added fallback string to prevent crash on boot
const client = new MongoClient(uri || "mongodb://localhost:27017");

console.log("✅ Chorister Routes Loaded");

router.post("/chorister", async (req, res) => {
  try {
    await client.connect();
    
    const db = client.db("1000t-admin");
    const collection = db.collection("choristers");

    console.log("📥 Received Chorister Submission:", req.body);

    const result = await collection.insertOne({
      ...req.body,
      submittedAt: new Date()
    });

    res.status(200).json({ 
      success: true, 
      message: "Chorister registration saved successfully",
      id: result.insertedId
    });

  } catch (err: any) {
    console.error("❌ Backend Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error while saving registration",
      error: err.message 
    });
  }
});

export default router;