import { Router } from "express";
import { google } from "googleapis";

const router = Router();

// VERCEL FIX: Use Environment Variable instead of physical file for Google Auth
const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];
const credentialsEnv = process.env.GOOGLE_CREDENTIALS;
const credentials = credentialsEnv ? JSON.parse(credentialsEnv) : {};

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

router.get("/gallery", async (req, res) => {
  try {
    const drive = google.drive({ version: "v3", auth });
    
    const FOLDER_ID = "1X2bxv-CA9thWNd7YxG-PQnavPhGAFdlA"; 

    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: "files(id, name, thumbnailLink)",
      orderBy: "createdTime desc", 
    });

    const images = response.data.files?.map(file => {
      let finalUrl = file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, "=s1080") : "";

      if (!finalUrl) {
        finalUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1080`;
      }

      return {
        id: file.id,
        name: file.name,
        url: finalUrl 
      };
      
    }) || [];

    res.status(200).json(images);

  } catch (error) {
    console.error("❌ Gallery Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch images from Google Drive" });
  }
});

export default router;