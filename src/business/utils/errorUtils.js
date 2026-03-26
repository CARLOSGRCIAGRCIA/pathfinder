export function AppError(message, statusCode = 500, code = null) {
  if (!(this instanceof AppError)) {
    return new AppError(message, statusCode, code);
  }
  Error.call(this, message);
  this.message = message;
  this.statusCode = statusCode;
  this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  this.code = code || `ERR_${statusCode}`;
  this.isOperational = true;
  Error.captureStackTrace(this, this.constructor);
}

AppError.prototype = Object.create(Error.prototype);
AppError.prototype.constructor = AppError;

export const createError = (message, statusCode = 500, code = null) => {
  return new AppError(message, statusCode, code);
};

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_FIELD: 'DUPLICATE_FIELD',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

export const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}
