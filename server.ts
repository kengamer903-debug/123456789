import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

// 1. API Routes (Minimal or None for static deployment)
app.use(express.json());

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Ensure data.json exists
const DATA_FILE = path.join(__dirname, 'uploads', 'audio_map.json');
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'scene-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// API to get the audio map
app.get('/api/audio-map', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read audio map' });
  }
});

// API to upload audio for a specific scene
app.post('/api/upload-audio', upload.single('audio'), (req, res) => {
  try {
    const sceneId = req.body.sceneId;
    if (!sceneId || !req.file) {
      return res.status(400).json({ error: 'Missing sceneId or file' });
    }

    const audioUrl = `/uploads/${req.file.filename}`;
    
    // Update data.json
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    data[sceneId] = audioUrl;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.json({ success: true, sceneId, audioUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload audio' });
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
