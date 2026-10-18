import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { setupSocketHandlers } from './sockets/socketHandler';
import { EventScheduler } from './services/eventScheduler';
import { seedDatabase } from './seeds/seed';
import { User } from './models/User';

import authRoutes from './routes/authRoutes';
import scenarioRoutes from './routes/scenarioRoutes';
import sessionRoutes from './routes/sessionRoutes';
import decisionRoutes from './routes/decisionRoutes';
import aarRoutes from './routes/aarRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
const server = http.createServer(app);

const configuredOrigins = (ENV.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim().replace(/\/$/, ''))
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;
  const cleanOrigin = origin.replace(/\/$/, '');
  if (configuredOrigins.includes(cleanOrigin) || defaultOrigins.includes(cleanOrigin)) {
    return true;
  }
  if (cleanOrigin.endsWith('.vercel.app')) {
    return true;
  }
  return false;
};

// Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS blocked for Socket.IO origin'));
      }
    },
    credentials: true,
  },
});

EventScheduler.setSocketServer(io);
setupSocketHandlers(io);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    name: 'SITU-AWARE API',
    version: '1.0.0',
    platform: 'SIH26248 - Ministry of Defence',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/sessions', decisionRoutes);
app.use('/api/aar', aarRoutes);
app.use('/api/users', userRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server
async function start() {
  try {
    await connectDB();

    // Auto-seed if database has no users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Running initial seed data...');
      await seedDatabase();
    }

    server.listen(ENV.PORT, () => {
      console.log(`=======================================================`);
      console.log(`  SITU-AWARE BACKEND RUNNING ON PORT ${ENV.PORT}`);
      console.log(`  SIH26248: Ministry of Defence Training Simulator`);
      console.log(`  Client Origin: ${ENV.CLIENT_URL}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { app, server };
