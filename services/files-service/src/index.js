const express = require('express');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const { FilesController } = require('./controllers/filesController');

const app = express();
const PORT = process.env.PORT || 4011;

// Configurar multer para uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    console.log(`File filter: ${file.originalname}, ${file.mimetype}`);
    cb(null, true); // Aceptar todos los archivos temporalmente
  },
});

const filesController = new FilesController();

// Middleware
app.use(
  cors({
    origin: '*', // En producción, especifica tu dominio
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'files-service',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Files service is working!',
    endpoints: {
      upload: 'POST /upload',
      viewFile: 'GET /files/:id/view',
      health: 'GET /health',
    },
  });
});

// Upload endpoint
app.post('/upload', upload.single('file'), filesController.upload);

// Otros endpoints
app.get('/files/:id/view', filesController.viewFile);
app.get('/users/:userId/files', filesController.getUserFiles);
app.delete('/files/:id', filesController.deleteFile);

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: 'File upload error',
      message: err.message,
      code: err.code,
    });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log('=======================================');
  console.log(`🚀 Files Service started on port ${PORT}`);
  console.log(`📁 Upload: POST http://localhost:${PORT}/upload`);
  console.log(`❤️  Health: GET http://localhost:${PORT}/health`);
  console.log(`🔧 Test: GET http://localhost:${PORT}/test`);
  console.log('=======================================');
});
