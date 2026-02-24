import express from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const sceneId = req.params.sceneId;
    const ext = path.extname(file.originalname) || '.mp3'; // Default to .mp3 if no extension
    cb(null, `scene_${sceneId}${ext}`);
  }
});

const upload = multer({ storage });

const app = express();

// 1. API Routes
app.use(express.json());

// Upload Route
app.post('/api/upload/:sceneId', (req, res, next) => {
  const sceneId = req.params.sceneId;
  // Cleanup old files
  try {
      const existingFiles = fs.readdirSync(UPLOADS_DIR).filter(f => f.startsWith(`scene_${sceneId}.`));
      existingFiles.forEach(f => fs.unlinkSync(path.join(UPLOADS_DIR, f)));
  } catch (e) {
      console.error("Error cleaning up old files:", e);
  }
  next();
}, upload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, url: `/api/audio/${req.params.sceneId}` });
});

// Get Audio Route
app.get('/api/audio/:sceneId', (req, res) => {
  const sceneId = req.params.sceneId;
  try {
      const files = fs.readdirSync(UPLOADS_DIR);
      const foundFile = files.find(f => f.startsWith(`scene_${sceneId}.`));
      if (foundFile) {
        res.sendFile(path.join(UPLOADS_DIR, foundFile));
      } else {
        res.status(404).send('Not found');
      }
  } catch (e) {
      res.status(404).send('Not found');
  }
});

// List Audios Route
app.get('/api/audios', (req, res) => {
  try {
      const files = fs.readdirSync(UPLOADS_DIR);
      const audioMap: Record<string, string> = {};
      files.forEach(file => {
        const match = file.match(/^scene_(\d+)\./);
        if (match) {
          audioMap[match[1]] = `/api/audio/${match[1]}`;
        }
      });
      res.json(audioMap);
  } catch (e) {
      res.json({});
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
