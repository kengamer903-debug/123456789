import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve uploads directory
app.use('/uploads', express.static(uploadsDir));

// Audio map file
const audioMapFile = path.join(__dirname, 'audio-map.json');
if (!fs.existsSync(audioMapFile)) {
  fs.writeFileSync(audioMapFile, JSON.stringify({}));
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // Keep original extension if possible, else default to .webm or .wav
    const ext = path.extname(file.originalname) || '';
    cb(null, 'audio-' + uniqueSuffix + ext)
  }
})
const upload = multer({ storage: storage })

// API endpoints
app.get('/api/audio/map', (req, res) => {
  try {
    const data = fs.readFileSync(audioMapFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(500).json({ error: 'Failed to read audio map' });
  }
});

app.post('/api/audio/upload', upload.single('audio'), (req, res) => {
  try {
    const sceneId = req.body.sceneId;
    if (!sceneId || !req.file) {
      return res.status(400).json({ error: 'Missing sceneId or audio file' });
    }
    
    const audioUrl = `/uploads/${req.file.filename}`;
    
    // Update map
    const data = fs.readFileSync(audioMapFile, 'utf8');
    const map = JSON.parse(data);
    
    // Delete old file if exists
    if (map[sceneId]) {
      const oldFilePath = path.join(__dirname, map[sceneId]);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    map[sceneId] = audioUrl;
    fs.writeFileSync(audioMapFile, JSON.stringify(map, null, 2));
    
    res.json({ success: true, audioUrl });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to upload audio' });
  }
});

app.delete('/api/audio/map/:sceneId', (req, res) => {
  try {
    const sceneId = req.params.sceneId;
    const data = fs.readFileSync(audioMapFile, 'utf8');
    const map = JSON.parse(data);
    
    if (map[sceneId]) {
      const filePath = path.join(__dirname, map[sceneId]);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      delete map[sceneId];
      fs.writeFileSync(audioMapFile, JSON.stringify(map, null, 2));
    }
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete audio' });
  }
});

// 2. Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    
    // Handle SPA routing in production
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Only listen if not running on Vercel
  if (process.env.VERCEL !== '1') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
