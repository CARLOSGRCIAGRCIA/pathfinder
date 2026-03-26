export const successResponse = (data = null, message = 'Success', meta = null) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta) {
    response.meta = meta;
  }

  return response;
};

export const errorResponse = (
  message = 'An error occurred',
  code = 'ERROR',
  statusCode = 400,
  details = null
) => {
  const response = {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
  };

  if (details) {
    response.details = details;
  }

  return response;
};

export const paginatedResponse = (data, pagination) => {
  return {
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: pagination.pages,
      hasNext: pagination.page < pagination.pages,
      hasPrev: pagination.page > 1,
    },
    timestamp: new Date().toISOString(),
  };
};

export const createdResponse = (data, message = 'Resource created successfully') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const noContentResponse = () => {
  return {
    success: true,
    timestamp: new Date().toISOString(),
  };
};

export const notFoundResponse = (resource = 'Resource') => {
  return {
    success: false,
    message: `${resource} not found`,
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
  };
};

export const unauthorizedResponse = (message = 'Unauthorized') => {
  return {
    success: false,
    message,
    code: 'UNAUTHORIZED',
    timestamp: new Date().toISOString(),
  };
};

export const forbiddenResponse = (message = 'Forbidden') => {
  return {
    success: false,
    message,
    code: 'FORBIDDEN',
    timestamp: new Date().toISOString(),
  };
};

export const validationErrorResponse = errors => {
  return {
    success: false,
    message: 'Validation failed',
    code: 'VALIDATION_ERROR',
    errors,
    timestamp: new Date().toISOString(),
  };
};

export const conflictResponse = message => {
  return {
    success: false,
    message,
    code: 'CONFLICT',
    timestamp: new Date().toISOString(),
  };
};

export const rateLimitResponse = (retryAfter = 900) => {
  return {
    success: false,
    message: 'Too many requests',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter,
    timestamp: new Date().toISOString(),
  };
};

export default {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  conflictResponse,
  rateLimitResponse,
};
