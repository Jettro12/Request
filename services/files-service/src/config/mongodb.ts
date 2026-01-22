// services/files-service/src/config/mongodb.ts
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let gridFSBucket: GridFSBucket;
let isConnected = false;

export const connectMongoDB = async (): Promise<void> => {
  if (isConnected) return;

  try {
    const mongoURI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/files_db';

    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Configurar GridFSBucket
    const db = mongoose.connection.db;
    gridFSBucket = new GridFSBucket(db, {
      bucketName: 'uploads',
      chunkSizeBytes: 255 * 1024, // 255KB chunks
    });

    isConnected = true;
    console.log('✅ Connected to MongoDB with GridFS');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export const getGridFSBucket = (): GridFSBucket => {
  if (!gridFSBucket) {
    throw new Error('GridFSBucket not initialized. Call connectMongoDB first.');
  }
  return gridFSBucket;
};

export const disconnectMongoDB = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('Disconnected from MongoDB');
  }
};
