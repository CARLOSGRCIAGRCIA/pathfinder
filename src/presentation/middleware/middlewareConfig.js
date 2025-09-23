import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import cors from "cors";
import compression from "compression";
import Environment from "../../data/config/environment.js";
import { createCacheMiddleware } from "./cacheMiddleware.js";
import { trackRequests } from "./trackingMiddleware.js";
import logger, { loggingMiddleware, morganStream } from './logger.js';

export const configureMiddleware = (app) => {
  app.use(helmet());

  app.use(loggingMiddleware);
  
  const limiter = rateLimit({
    max: 10000,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour!",
  });
  app.use("/api", limiter);

  app.use(express.json({ limit: "10kb" }));

  app.use(mongoSanitize());
  app.use(xss());
  app.use(hpp());

  app.use(cors());
  app.use(compression());
  app.use(trackRequests);


  const cacheMiddleware = createCacheMiddleware({
    max: 50,
    maxAge: 30000
  });
  
  app.use(cacheMiddleware);
  app.use("/api", cacheMiddleware);

};
