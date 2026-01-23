const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4011;

// ✅ Configuración de BASE_URL dinámica para AWS o Local
// Si estás en AWS, BASE_URL debe ser la del Load Balancer
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// ✅ CORS consistente con tus otros microservicios
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://frontend:3000",
      "http://app-alb-896588448.us-east-1.elb.amazonaws.com", // Agregamos tu ALB
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* =====================================================
   RUTAS DEL MICROSERVICIO (Ajustadas para Nginx)
===================================================== */

// ✅ Health check (prioridad para el Load Balancer)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'files-service',
    timestamp: new Date().toISOString(),
  });
});

// ✅ Endpoint de subida
// Nota: Nginx redirige /api/files/upload -> files-service:4011/upload
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const file = req.file;
    const { userId = 'anonymous', type = 'general' } = req.body;
    const fileId = uuidv4();

    // ✅ La URL ahora apunta al dominio público a través de Nginx
    const fileUrl = `${BASE_URL}/api/files/files/${fileId}`;

    console.log(`✅ Uploaded: ${file.originalname} for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: { // Envolvemos en 'data' para consistencia con tu ApiClient
        file: {
          id: fileId,
          filename: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: fileUrl,
          uploadedAt: new Date().toISOString(),
          userId: userId,
          type: type,
        }
      },
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// ✅ Obtener archivo por ID
app.get('/files/:id', (req, res) => {
  res.json({ 
    id: req.params.id, 
    message: 'File found (Simulado)',
    url: `${BASE_URL}/api/files/files/${req.params.id}` 
  });
});

// ✅ Obtener archivos de un usuario
app.get('/users/:userId', (req, res) => {
  res.json({ 
    userId: req.params.userId, 
    files: [],
    success: true 
  });
});

// Inicio del servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('=======================================');
  console.log(`🚀 Files Service started on port ${PORT}`);
  console.log(`🌍 Base URL: ${BASE_URL}`);
  console.log('=======================================');
});