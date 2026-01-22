const { v4: uuidv4 } = require('uuid');

class FilesController {
  constructor() {
    // Bind methods
    this.upload = this.upload.bind(this);
    this.viewFile = this.viewFile.bind(this);
    this.getUserFiles = this.getUserFiles.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
  }

  // Subir archivo - VERSIÓN FUNCIONAL
  async upload(req, res) {
    try {
      console.log('=== UPLOAD REQUEST ===');
      console.log('Headers:', req.headers['content-type']);
      console.log('Body:', req.body);
      console.log('File present:', !!req.file);

      const file = req.file;
      if (!file) {
        console.log('ERROR: No file in request');
        return res.status(400).json({
          success: false,
          error: 'No file provided',
          details: 'Make sure to use form-data with "file" field',
        });
      }

      const { userId = 'test-user', type = 'avatar', tags = '' } = req.body;

      console.log(`File: ${file.originalname}`);
      console.log(`Size: ${file.size} bytes`);
      console.log(`Type: ${file.mimetype}`);
      console.log(`User: ${userId}`);
      console.log(`Upload type: ${type}`);

      // Validar tipo de archivo
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'application/pdf',
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'File type not allowed',
          allowedTypes: allowedTypes,
        });
      }

      // Generar ID único
      const fileId = uuidv4();
      const filename = `${fileId}_${file.originalname}`;

      // Simular guardado en MongoDB (para producción real conectarías a MongoDB)
      const savedFile = {
        _id: fileId,
        userId: userId,
        filename: filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        type: type,
        uploadedAt: new Date(),
        metadata: {
          width: 800,
          height: 600,
        },
        tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
      };

      console.log('File saved (simulated):', savedFile._id);

      // URL de acceso
      const baseUrl = process.env.BASE_URL || 'http://localhost:4011';

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          id: savedFile._id,
          filename: savedFile.originalName,
          url: `${baseUrl}/files/${savedFile._id}/view`,
          thumbnailUrl: savedFile.mimeType.startsWith('image')
            ? `${baseUrl}/files/${savedFile._id}/thumbnail`
            : null,
          type: savedFile.type,
          size: savedFile.size,
          uploadedAt: savedFile.uploadedAt,
          metadata: savedFile.metadata,
        },
      });
    } catch (error) {
      console.error('UPLOAD ERROR:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
      });
    }
  }

  // Ver archivo
  async viewFile(req, res) {
    try {
      const { id } = req.params;
      console.log(`View file request: ${id}`);

      // Simular archivo
      res.json({
        success: true,
        message: 'File view endpoint',
        id: id,
        url: `http://localhost:4011/files/${id}/download`,
      });
    } catch (error) {
      console.error('View file error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Obtener archivos del usuario
  async getUserFiles(req, res) {
    try {
      const { userId } = req.params;
      console.log(`Get files for user: ${userId}`);

      // Simular lista de archivos
      res.json({
        success: true,
        files: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
        },
      });
    } catch (error) {
      console.error('Get user files error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Eliminar archivo
  async deleteFile(req, res) {
    try {
      const { id } = req.params;
      console.log(`Delete file: ${id}`);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = { FilesController };
