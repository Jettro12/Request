const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 4011;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'files-service',
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Files service is working!' });
});

// Upload endpoint funcional
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    console.log('=== UPLOAD REQUEST ===');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        hint: "Use form-data with 'file' field",
      });
    }

    const file = req.file;
    const { userId = 'anonymous', type = 'general' } = req.body;

    console.log(`File: ${file.originalname}`);
    console.log(`Size: ${file.size} bytes`);
    console.log(`Type: ${file.mimetype}`);
    console.log(`User: ${userId}`);
    console.log(`Upload type: ${type}`);

    // Generar respuesta
    const fileId = uuidv4();

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: fileId,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `http://localhost:4011/files/${fileId}`,
        uploadedAt: new Date().toISOString(),
        userId: userId,
        type: type,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// Other endpoints (simplified)
app.get('/files/:id', (req, res) => {
  res.json({ id: req.params.id, message: 'File endpoint' });
});

app.get('/users/:userId/files', (req, res) => {
  res.json({ userId: req.params.userId, files: [] });
});

// Start server
app.listen(PORT, () => {
  console.log('=======================================');
  console.log(`🚀 Files Service started on port ${PORT}`);
  console.log(`📁 Upload: POST http://localhost:${PORT}/upload`);
  console.log(`❤️  Health: GET http://localhost:${PORT}/health`);
  console.log('=======================================');
});
