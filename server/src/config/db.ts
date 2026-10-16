import mongoose from 'mongoose';
import { ENV } from './env';

let memoryServer: any = null;

export async function connectDB(): Promise<string> {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.host || 'connected';
  }

  let uri = ENV.MONGO_URI;

  if (uri) {
    try {
      console.log(`[DB] Attempting connection to configured MongoDB: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
      console.log('[DB] Connected successfully to primary MongoDB.');
      return uri;
    } catch (err: any) {
      console.warn(`[DB] Could not connect to configured MongoDB (${err.message}). Falling back to in-memory database.`);
    }
  }

  // Fallback to MongoMemoryServer for immediate zero-config execution
  try {
    if (!memoryServer) {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'situaware',
        },
      });
    }
    uri = memoryServer.getUri();
    await mongoose.connect(uri);
    console.log(`[DB] Connected successfully to in-memory MongoDB (${uri}). Ready for zero-friction development & testing.`);
    return uri;
  } catch (err: any) {
    console.error('[DB] Failed to initialize in-memory MongoDB:', err);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
