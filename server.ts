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
  console.log(`[Upload] Request for scene ${sceneId}`);
  
  // Cleanup old files
  try {
      if (fs.existsSync(UPLOADS_DIR)) {
          const existingFiles = fs.readdirSync(UPLOADS_DIR).filter(f => f.startsWith(`scene_${sceneId}.`));
          existingFiles.forEach(f => {
              console.log(`[Upload] Deleting old file: ${f}`);
              fs.unlinkSync(path.join(UPLOADS_DIR, f));
          });
      }
  } catch (e) {
      console.error("[Upload] Error cleaning up old files:", e);
  }
  next();
}, upload.single('audio'), (req, res) => {
  if (!req.file) {
      console.error("[Upload] No file received");
      return res.status(400).json({ error: 'No file uploaded' });
  }
  console.log(`[Upload] Success: ${req.file.filename}`);
  res.json({ success: true, url: `/api/audio/${req.params.sceneId}`, filename: req.file.filename });
});

// Get Audio Route
app.get('/api/audio/:sceneId', (req, res) => {
  const sceneId = req.params.sceneId;
  console.log(`[GetAudio] Request for scene ${sceneId}`);
  try {
      if (!fs.existsSync(UPLOADS_DIR)) {
          console.warn("[GetAudio] Uploads dir not found");
          return res.status(404).send('Not found');
      }
      
      const files = fs.readdirSync(UPLOADS_DIR);
      const foundFile = files.find(f => f.startsWith(`scene_${sceneId}.`));
      
      if (foundFile) {
        console.log(`[GetAudio] Serving file: ${foundFile}`);
        const filePath = path.join(UPLOADS_DIR, foundFile);
        res.sendFile(filePath);
      } else {
        console.warn(`[GetAudio] File not found for scene ${sceneId}`);
        res.status(404).send('Not found');
      }
  } catch (e) {
      console.error("[GetAudio] Error:", e);
      res.status(404).send('Not found');
  }
});

// List Audios Route
app.get('/api/audios', (req, res) => {
  console.log("[ListAudios] Request received");
  try {
      if (!fs.existsSync(UPLOADS_DIR)) {
          return res.json({});
      }
      
      const files = fs.readdirSync(UPLOADS_DIR);
      const audioMap: Record<string, string> = {};
      files.forEach(file => {
        const match = file.match(/^scene_(\d+)\./);
        if (match) {
          audioMap[match[1]] = `/api/audio/${match[1]}`;
        }
      });
      console.log(`[ListAudios] Found ${Object.keys(audioMap).length} custom audios`);
      res.json(audioMap);
  } catch (e) {
      console.error("[ListAudios] Error:", e);
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
