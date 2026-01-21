// services/files-service/src/controllers/filesController.ts
import { Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import FileService from '../services/fileService';
import { GridFSService } from '../services/gridfsService';
import { ThumbnailService } from '../services/thumbnailService';

export class FilesController {
  private fileService: FileService;
  private gridfsService: GridFSService;
  private thumbnailService: ThumbnailService;

  constructor() {
    this.fileService = new FileService();
    this.gridfsService = new GridFSService();
    this.thumbnailService = new ThumbnailService();
  }

  // Subir archivo
  upload = async (req: Request, res: Response) => {
    try {
      const { userId, type = 'other', tags = '' } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Validar tipo de archivo
      const allowedTypes = ['image', 'video'];
      const fileType = file.mimetype.split('/')[0];
      if (!allowedTypes.includes(fileType)) {
        return res.status(400).json({ error: 'File type not allowed' });
      }

      // Verificar límite de almacenamiento
      const canUpload = await this.fileService.checkStorageLimit(
        userId,
        file.size,
      );
      if (!canUpload) {
        return res.status(400).json({ error: 'Storage limit exceeded' });
      }

      // Generar ID único para el archivo
      const fileId = uuidv4();
      const filename = `${fileId}_${file.originalname}`;

      // Subir a GridFS
      const gridfsId = await this.gridfsService.uploadFile(
        require('stream').Readable.from(file.buffer),
        filename,
        {
          mimeType: file.mimetype,
          originalName: file.originalname,
          userId,
          type,
          uploadedAt: new Date(),
        },
      );

      // Extraer metadatos
      let metadata = {};
      if (fileType === 'image') {
        metadata = await this.thumbnailService.extractImageMetadata(
          file.buffer,
        );
      } else if (fileType === 'video') {
        metadata = await this.thumbnailService.extractVideoMetadata(
          file.buffer,
        );

        // Generar thumbnail para video
        const thumbnailBuffer =
          await this.thumbnailService.generateVideoThumbnail(file.buffer);
        const thumbnailId = uuidv4();
        const thumbnailGridfsId = await this.gridfsService.uploadFile(
          require('stream').Readable.from(thumbnailBuffer),
          `${thumbnailId}_thumbnail.jpg`,
          { mimeType: 'image/jpeg', isThumbnail: true },
        );

        // Guardar referencia al thumbnail
        metadata = { ...metadata, thumbnailId: thumbnailGridfsId.toString() };
      }

      // Guardar en base de datos
      const savedFile = await this.fileService.createFileRecord({
        userId,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        type: type as any,
        fileId: gridfsId,
        metadata,
        tags: tags.split(',').filter((tag) => tag.trim()),
      });

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          id: savedFile._id,
          url: `${process.env.BASE_URL}/files/${savedFile._id}/view`,
          thumbnailUrl: metadata.thumbnailId
            ? `${process.env.BASE_URL}/files/${metadata.thumbnailId}/view`
            : null,
          type: savedFile.type,
          size: savedFile.size,
          uploadedAt: savedFile.uploadedAt,
        },
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Ver archivo
  viewFile = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const range = req.headers.range;

      const file = await this.fileService.getFileById(id);
      if (!file || file.deleted) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Incrementar contador de vistas
      await this.fileService.incrementViewCount(id);

      const { stream, length, contentType } =
        await this.gridfsService.getFileStream(
          file.fileId as any,
          range ? this.parseRange(range, length) : undefined,
        );

      // Configurar headers para streaming de video
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : length - 1;
        const chunkSize = end - start + 1;

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${length}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': contentType,
        });
      } else {
        res.writeHead(200, {
          'Content-Length': length,
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000', // Cache de 1 año
        });
      }

      stream.pipe(res);
    } catch (error) {
      console.error('Error viewing file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Obtener archivos del usuario
  getUserFiles = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { type, page = '1', limit = '20' } = req.query;

      const files = await this.fileService.getUserFiles(
        userId,
        type as string,
        parseInt(page as string),
        parseInt(limit as string),
      );

      // Formatear respuesta con URLs
      const formattedFiles = files.map((file) => ({
        id: file._id,
        filename: file.filename,
        type: file.type,
        size: file.size,
        mimeType: file.mimeType,
        url: `${process.env.BASE_URL}/files/${file._id}/view`,
        thumbnailUrl: file.thumbnail
          ? `${process.env.BASE_URL}/files/${file.thumbnail}/view`
          : null,
        uploadedAt: file.uploadedAt,
        metadata: file.metadata,
      }));

      res.json({
        success: true,
        files: formattedFiles,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: formattedFiles.length,
        },
      });
    } catch (error) {
      console.error('Error getting user files:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Eliminar archivo
  deleteFile = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const file = await this.fileService.getFileById(id);
      if (!file || file.userId !== userId) {
        return res
          .status(404)
          .json({ error: 'File not found or unauthorized' });
      }

      await this.fileService.deleteFile(id);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Helper para parsear range headers
  private parseRange(
    range: string,
    length: number,
  ): { start: number; end: number } {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : length - 1;
    return { start, end };
  }
}
