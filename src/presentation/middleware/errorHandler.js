import { AppError } from '../../business/utils/errorUtils.js';
import Environment from '../../data/config/environment.js';
import logger from './logger.js';

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400, 'INVALID_ID');
};

const handleDuplicateFieldsDB = err => {
  const field = Object.keys(err.keyValue)[0];
  const message = `Duplicate field value: "${field}". Please use another value!`;
  return new AppError(message, 409, 'DUPLICATE_FIELD');
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401, 'INVALID_TOKEN');
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401, 'TOKEN_EXPIRED');

const handleMongooseError = err => {
  if (err.name === 'MongooseError') {
    return new AppError('Database connection error. Please try again later.', 503, 'DB_ERROR');
  }
  return null;
};

const sendErrorDev = (err, res, req) => {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req?.originalUrl,
    method: req?.method,
    code: err.code,
  });

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    code: err.code || `ERR_${err.statusCode}`,
    path: req?.originalUrl,
    timestamp: new Date().toISOString(),
    ...(Environment.isDevelopment && { stack: err.stack }),
  });
};

const sendErrorProd = (err, res, req) => {
  logger.error(`Error: ${err.message}`, {
    path: req?.originalUrl,
    method: req?.method,
    code: err.code,
  });

  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      code: err.code || `ERR_${err.statusCode}`,
      path: req?.originalUrl,
      timestamp: new Date().toISOString(),
    });
  } else {
    logger.error('Non-operational error detected:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went very wrong!',
      code: 'INTERNAL_ERROR',
      path: req?.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
};

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (!err.name) {
    err.name = 'Error';
  }

  logger.error('Request Error:', {
    message: err.message,
    name: err.name,
    statusCode: err.statusCode,
    code: err.code,
    path: req.originalUrl,
    method: req.method,
  });

  if (Environment.isDevelopment) {
    sendErrorDev(err, res, req);
  } else if (Environment.isProduction) {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    const mongooseError = handleMongooseError(error);
    if (mongooseError) error = mongooseError;

    sendErrorProd(error, res, req);
  }
};

export class NotFoundError extends Error {
  constructor(path) {
    super(`Route ${path} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.status = 'fail';
    this.code = 'NOT_FOUND';
    this.isOperational = true;
  }
}
