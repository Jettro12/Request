// services/files-service/src/models/File.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  _id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number; // en bytes
  type: 'avatar' | 'cover' | 'post_image' | 'post_video' | 'document' | 'other';
  bucket: string; // gridfs bucket name
  fileId: mongoose.Types.ObjectId; // referencia a GridFS
  metadata: {
    width?: number;
    height?: number;
    duration?: number; // para videos en segundos
    format?: string;
    bitrate?: number; // para videos
    compression?: string;
  };
  thumbnail?: string; // ID de miniatura si es video/imagen
  isPublic: boolean;
  tags: string[];
  views: number;
  downloads: number;
  uploadedAt: Date;
  expiresAt?: Date; // para archivos temporales
  deleted: boolean;
  deletedAt?: Date;
}

const FileSchema = new Schema<IFile>(
  {
    userId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    type: {
      type: String,
      enum: [
        'avatar',
        'cover',
        'post_image',
        'post_video',
        'document',
        'other',
      ],
      default: 'other',
    },
    bucket: { type: String, default: 'uploads' },
    fileId: { type: Schema.Types.ObjectId, required: true },
    metadata: {
      width: Number,
      height: Number,
      duration: Number,
      format: String,
      bitrate: Number,
      compression: String,
      _id: false,
    },
    thumbnail: { type: String },
    isPublic: { type: Boolean, default: true },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    deleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true },
);

// Índices para búsquedas eficientes
FileSchema.index({ userId: 1, type: 1 });
FileSchema.index({ uploadedAt: -1 });
FileSchema.index({ tags: 1 });
FileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IFile>('File', FileSchema);
