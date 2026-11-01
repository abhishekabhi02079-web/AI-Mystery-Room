import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If response has already started streaming, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Request payload failed schema validation.',
      details: formattedErrors,
    });
    return;
  }

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = err.message || 'An unexpected internal error occurred on the detective server.';

  if (statusCode >= 500) {
    console.error(`[SERVER ERROR 500] ${req.method} ${req.url}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: err.error || 'Server Error',
    message,
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
