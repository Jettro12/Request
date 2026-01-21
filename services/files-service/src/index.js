// services/files-service/src/index.ts o index.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const { FilesController } = require('./controllers/filesController');

const app = express();
const PORT = process.env.PORT || 4011;
const upload = multer({ storage: multer.memoryStorage() });
const filesController = new FilesController();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'files-service' });
});

// Upload endpoint usando el controller REAL
app.post('/upload', upload.single('file'), filesController.upload);

// Otros endpoints
app.get('/files/:id/view', filesController.viewFile);
app.get('/users/:userId/files', filesController.getUserFiles);
app.delete('/files/:id', filesController.deleteFile);

app.listen(PORT, () => {
  console.log(`Files service listening on port ${PORT}`);
});
