// services/files-service/src/services/gridfsService.ts
import { Readable } from 'stream';
import mongoose from 'mongoose';
import { getGridFSBucket } from '../config/mongodb';
import File from '../models/File';

export class GridFSService {
  private bucket;

  constructor() {
    this.bucket = getGridFSBucket();
  }

  // Subir archivo a GridFS
  async uploadFile(
    readableStream: Readable,
    filename: string,
    metadata: any = {},
  ): Promise<mongoose.Types.ObjectId> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(filename, {
        metadata,
        contentType: metadata.mimeType,
      });

      readableStream
        .pipe(uploadStream)
        .on('error', reject)
        .on('finish', () => {
          resolve(uploadStream.id);
        });
    });
  }

  // Descargar archivo de GridFS
  async downloadFile(fileId: mongoose.Types.ObjectId): Promise<Readable> {
    return this.bucket.openDownloadStream(fileId);
  }

  // Obtener metadatos del archivo
  async getFileInfo(fileId: mongoose.Types.ObjectId): Promise<any> {
    const files = await this.bucket.find({ _id: fileId }).toArray();
    return files[0] || null;
  }

  // Eliminar archivo de GridFS
  async deleteFile(fileId: mongoose.Types.ObjectId): Promise<void> {
    await this.bucket.delete(fileId);
  }

  // Obtener stream para vista previa (range requests para videos)
  async getFileStream(
    fileId: mongoose.Types.ObjectId,
    start?: number,
    end?: number,
  ): Promise<{ stream: Readable; length: number; contentType: string }> {
    const fileInfo = await this.getFileInfo(fileId);

    if (!fileInfo) {
      throw new Error('File not found');
    }

    let stream: Readable;

    if (start !== undefined && end !== undefined) {
      // Para range requests (videos streaming)
      stream = this.bucket.openDownloadStream(fileId, { start, end });
    } else {
      stream = this.bucket.openDownloadStream(fileId);
    }

    return {
      stream,
      length: fileInfo.length,
      contentType: fileInfo.metadata?.mimeType || 'application/octet-stream',
    };
  }
}
