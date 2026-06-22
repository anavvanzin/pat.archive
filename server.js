const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Path to site directory and uploads directory
const siteDir = path.join(__dirname, 'site');
const uploadsDir = path.join(siteDir, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Sanitize and keep original extension
    const name = path.parse(file.originalname).name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}_${name}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.mp3', '.wav', '.ogg', '.m4a', '.flac'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de áudio inválido. Envie MP3, WAV, OGG, M4A ou FLAC.'));
    }
  },
  limits: { fileSize: 40 * 1024 * 1024 } // 40MB limit
});

// GET /api/tracks - Lists all available tracks (built-in + uploaded)
app.get('/api/tracks', (req, res) => {
  try {
    const defaultTracks = [
      { id: 'procedural', title: 'Sintetizador Procedural', artist: 'Cabine', len: 'Loop', url: null, bpm: 124 }
    ];

    // Read site/uploads directory
    fs.readdir(uploadsDir, (err, files) => {
      if (err) {
        return res.json(defaultTracks);
      }

      const uploadedTracks = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.mp3', '.wav', '.ogg', '.m4a', '.flac'].includes(ext);
        })
        .map(file => {
          // Format clean title
          const cleanName = file
            .replace(/^\d+_/, '') // remove timestamp prefix
            .replace(/_/g, ' ')
            .replace(/\.[^/.]+$/, ''); // remove extension
            
          return {
            id: file,
            title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
            artist: 'Upload',
            len: 'Vários',
            url: `uploads/${file}`,
            bpm: 124 // Default fallback bpm
          };
        });

      res.json([...defaultTracks, ...uploadedTracks]);
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/upload - Handle file upload
app.post('/api/upload', upload.single('track'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const file = req.file;
  const cleanName = file.filename
    .replace(/^\d+_/, '')
    .replace(/_/g, ' ')
    .replace(/\.[^/.]+$/, '');

  res.json({
    ok: true,
    track: {
      id: file.filename,
      title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      artist: 'Upload',
      len: 'Vários',
      url: `uploads/${file.filename}`,
      bpm: 124
    }
  });
});

// Serve static site files
app.use(express.static(siteDir));

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`\n🔊 Servidor da Patricia rodando na porta ${PORT}`);
  console.log(`👉 Acesse: http://localhost:${PORT}\n`);
});
