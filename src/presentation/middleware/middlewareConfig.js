import express from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cors from 'cors';
import compression from 'compression';
import Environment from '../../data/config/environment.js';
import { createCacheMiddleware } from './cacheMiddleware.js';
import { trackRequests } from './trackingMiddleware.js';
import logger, { loggingMiddleware, morganStream } from './logger.js';
import { apiRateLimiter, authRateLimiter } from './redisRateLimiter.js';
import {
  requestIdMiddleware,
  requestTimerMiddleware,
  errorLoggingMiddleware,
} from './requestTracking.js';
import { inputSanitizationMiddleware, noCacheHeadersMiddleware } from './securityMiddleware.js';

export const configureMiddleware = app => {
  app.use(requestIdMiddleware);
  app.use(requestTimerMiddleware);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: Environment.isProduction
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
    })
  );

  app.use(loggingMiddleware);

  app.use('/api', apiRateLimiter);
  app.use('/api/users/login', authRateLimiter);
  app.use('/api/users/register', authRateLimiter);

  app.use(
    express.json({
      limit: '10kb',
      strict: true,
    })
  );

  app.use(
    express.urlencoded({
      extended: true,
      limit: '10kb',
      parameterLimit: 20,
    })
  );

  app.use(inputSanitizationMiddleware);

  app.use(
    mongoSanitize({
      onSanitize: ({ req, key }) => {
        logger.warn(`Mongo sanitize: ${key} in ${req.path}`);
      },
    })
  );

  app.use(xss());
  app.use(hpp());

  app.use(
    cors({
      origin: Environment.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
    })
  );

  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
      },
      level: 6,
      threshold: 1024,
    })
  );

  app.use(noCacheHeadersMiddleware);
  app.use(trackRequests);

  app.use(errorLoggingMiddleware);

  const cacheMiddleware = createCacheMiddleware({
    max: 50,
    maxAge: 30000,
  });

  app.use(cacheMiddleware);
  app.use('/api', cacheMiddleware);
};
