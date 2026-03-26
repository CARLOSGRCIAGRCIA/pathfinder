import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuidv4();

  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
};

export const requestTimerMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.connection?.remoteAddress,
    };

    if (duration > 1000) {
      console.warn('Slow request:', logData);
    } else {
      console.log('Request completed:', logData);
    }
  });

  next();
};

export const errorLoggingMiddleware = (err, req, res, next) => {
  console.error('Error details:', {
    requestId: req.id,
    method: req.method,
    url: req.url,
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    },
    body: req.body ? '[FILTERED]' : undefined,
    params: req.params,
    query: req.query,
  });

  next(err);
};

export default {
  requestIdMiddleware,
  requestTimerMiddleware,
  errorLoggingMiddleware,
};
