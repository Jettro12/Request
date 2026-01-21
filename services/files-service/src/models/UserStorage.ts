// services/files-service/src/models/UserStorage.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserStorage extends Document {
  userId: string;
  totalSize: number; // en bytes
  fileCount: number;
  limit: number; // límite personalizado (bytes), 0 = ilimitado
  avatarId?: string;
  coverId?: string;
  lastUpdated: Date;
}

const UserStorageSchema = new Schema<IUserStorage>(
  {
    userId: { type: String, required: true, unique: true },
    totalSize: { type: Number, default: 0 },
    fileCount: { type: Number, default: 0 },
    limit: { type: Number, default: 104857600 }, // 100MB por defecto
    avatarId: { type: String },
    coverId: { type: String },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model<IUserStorage>('UserStorage', UserStorageSchema);
