import winston from 'winston';
import path from 'path';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.error ? '\n' + info.error.stack : ''}`
  )
);

const logDir = 'logs';

const logger = winston.createLogger({
  level: 'debug', 
  levels,
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, 
      maxFiles: 5,
      tailable: true
    }),
    
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true
    }),

    new winston.transports.Console()
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.Console()
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.Console()
  ]
});

const loggerHelper = {
  error: (message, error) => {
    logger.error({
      message,
      error,
      timestamp: new Date().toISOString()
    });
  },
  
  warn: (message) => {
    logger.warn({
      message,
      timestamp: new Date().toISOString()
    });
  },
  
  info: (message) => {
    logger.info({
      message,
      timestamp: new Date().toISOString()
    });
  },
  
  debug: (message) => {
    logger.debug({
      message,
      timestamp: new Date().toISOString()
    });
  },
  
  http: (message) => {
    logger.http({
      message,
      timestamp: new Date().toISOString()
    });
  }
};

export const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    if (res.statusCode >= 400) {
      loggerHelper.error(message);
    } else {
      loggerHelper.http(message);
    }
  });

  next();
};

export const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

export default loggerHelper;