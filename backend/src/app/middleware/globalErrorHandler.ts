import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import config from '../config/index.js';
import ApiError from '../errorHelpers/ApiError.js';
import logger from '../utils/logger.js';

const globalErrorHandler: ErrorRequestHandler = (
  error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let code = 'INTERNAL_SERVER_ERROR';
  let details: { path: string | number; message: string }[] = [];

  if (error instanceof ApiError) {
    statusCode = error?.statusCode;
    message = error.message;
    details = error?.message ? [{ path: '', message: error?.message }] : [];
    code = error.name || 'API_ERROR';
  } else if (error instanceof Error) {
    message = error?.message;
    details = error?.message ? [{ path: '', message: error?.message }] : [];
  }

  // Log error using Winston
  logger.error(`${req.method} ${req.originalUrl} - ${message}`, {
    stack: error.stack,
    code,
    details
  });

  res.status(statusCode).json({
    success: false,
    message,
    code,
    details,
    stack: config.env !== 'production' ? error?.stack : undefined,
  });
};

export default globalErrorHandler;
