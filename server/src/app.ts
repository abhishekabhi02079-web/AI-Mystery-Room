import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import caseRoutes from './routes/caseRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

export function createApp(): Application {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  const allowedOrigins = [
    env.CLIENT_URL,
    ...(env.NODE_ENV === 'production' ? [] : ['http://localhost:5173', 'http://127.0.0.1:5173']),
  ];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
        } else {
          callback(null, allowedOrigins.includes(origin) ? origin : false);
        }
      },
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'x-case-token'],
    })
  );

  // Request parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Global rate limiter
  if (env.NODE_ENV !== 'test') {
    app.use('/api', generalLimiter);
  }

  // Mount API routes
  app.use('/api/health', healthRoutes);
  app.use('/api/cases', caseRoutes);

  // 404 handler for unmatched routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`,
    });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}

export default createApp();
