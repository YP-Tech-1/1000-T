import { Router, Request, Response } from 'express';
import { MongoClient } from 'mongodb';

const router = Router();

const uri = process.env.MONGODB_URI;
if (!uri) console.error("Warning: MONGODB_URI is not defined in .env");

// VERCEL FIX: Added fallback string to prevent crash
const client = new MongoClient(uri || "mongodb://localhost:27017");
const db = client.db("1000t-admin");

console.log("✅ Partnership Routes Loaded");

router.post('/partnerships', async (req: Request, res: Response) => {
  try {
    await client.connect();
    const collection = db.collection("partnerships");
    
    const newPartnership = {
      ...req.body,
      submittedAt: new Date()
    };

    const result = await collection.insertOne(newPartnership);
    
    console.log('✅ New partnership saved:', result.insertedId);
    res.status(201).json({ 
      message: 'Partnership saved successfully!', 
      data: { ...newPartnership, _id: result.insertedId }
    });
  } catch (error) {
    console.error('❌ Error saving partnership:', error);
    res.status(500).json({ 
      message: 'Server error while saving partnership', 
      error 
    });
  }
  // VERCEL FIX: Removed `finally { await client.close(); }` to prevent connection pool dropping
});

export default router;