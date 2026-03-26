import { sanitizeInput } from '../../business/utils/validationUtils.js';

export const inputSanitizationMiddleware = (req, res, next) => {
  const sanitizeObject = obj => {
    if (!obj) return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        if (
          key.toLowerCase().includes('password') ||
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('secret')
        ) {
          sanitized[key] = value;
        } else if (typeof value === 'string') {
          sanitized[key] = sanitizeInput(value);
        } else {
          sanitized[key] = sanitizeObject(value);
        }
      }
      return sanitized;
    }

    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

export const sizeLimitMiddleware = (options = {}) => {
  const { maxFields = 100 } = options;

  return (req, res, next) => {
    const countFields = obj => {
      if (!obj) return 0;
      if (typeof obj !== 'object') return 1;

      let count = 0;
      for (const key of Object.keys(obj)) {
        count++;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          count += countFields(obj[key]);
        }
      }
      return count;
    };

    const fieldCount = countFields(req.body) + countFields(req.query) + countFields(req.params);

    if (fieldCount > maxFields) {
      return res.status(413).json({
        success: false,
        message: 'Too many fields in request',
        code: 'PAYLOAD_TOO_LARGE',
      });
    }

    next();
  };
};

export const noCacheHeadersMiddleware = (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store',
  });
  next();
};

export default {
  inputSanitizationMiddleware,
  sizeLimitMiddleware,
  noCacheHeadersMiddleware,
};
