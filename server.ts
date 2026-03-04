import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import { createClient } from '@supabase/supabase-js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn("Supabase environment variables are missing. Supabase functionality will be disabled.");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

// 1. API Routes (Minimal or None for static deployment)
app.use(express.json());

// Serve uploaded files statically (if needed, but we are using Cloudinary now)
// app.use('/uploads', express.static(UPLOADS_DIR));

// Setup Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'audio_uploads',
    resource_type: 'video', // Cloudinary uses 'video' for audio files
  } as any,
});
const upload = multer({ storage: storage });

// API to get the audio map
app.get('/api/audio-map', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase is not configured' });
  }
  try {
    const { data, error } = await supabase
      .from('audio_map')
      .select('sceneId, audioUrl');
    
    if (error) throw error;

    const audioMap = data.reduce((acc, item) => {
      acc[item.sceneId] = item.audioUrl;
      return acc;
    }, {} as Record<string, string>);

    res.json(audioMap);
  } catch (error) {
    console.error("Error reading audio map from Supabase:", error);
    res.status(500).json({ error: 'Failed to read audio map' });
  }
});

// API to upload audio for a specific scene
app.post('/api/upload-audio', (req, res, next) => {
  upload.single('audio')(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: 'Multer error', details: err.message });
    }
    next();
  });
}, (req, res) => {
  console.log("Upload route hit!", req.body, req.file);
  try {
    const sceneId = req.body.sceneId;
    if (!sceneId || !req.file) {
      console.error("Missing sceneId or file", { sceneId, file: req.file });
      return res.status(400).json({ error: 'Missing sceneId or file' });
    }

    const audioUrl = (req.file as any).path;
    
    // Update Supabase
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase is not configured' });
    }
    const { error } = await supabase
      .from('audio_map')
      .upsert({ sceneId, audioUrl });
    
    if (error) throw error;

    res.json({ success: true, sceneId, audioUrl });
  } catch (error) {
    console.error("Upload error in server:", error);
    res.status(500).json({ error: 'Failed to upload audio', details: error instanceof Error ? error.message : String(error) });
  }
});

// 2. Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
