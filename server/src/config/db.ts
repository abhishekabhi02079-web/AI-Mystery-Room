import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export async function connectDB(customUri?: string): Promise<typeof mongoose> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const uri = customUri || env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      autoIndex: true,
    });
    isConnected = true;
    console.log(`[DATABASE] MongoDB connected successfully to ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    console.error('[DATABASE ERROR] Failed to connect to the configured MongoDB instance.');
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}
