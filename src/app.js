import express from 'express';
import { createServer } from 'http';
import Environment from './data/config/environment.js';
import {
  connectToDatabase,
  disconnectFromDatabase,
  getConnectionState,
} from './data/config/database.js';
import { connectToRedis, disconnectFromRedis, redisHealthCheck } from './data/config/redis.js';
import { AppError } from './business/utils/errorUtils.js';
import { configureMiddleware } from './presentation/middleware/middlewareConfig.js';
import routes from './presentation/routes/index.js';
import { errorHandler, NotFoundError } from './presentation/middleware/errorHandler.js';
import { displayWelcomeMessage, stopAnimation } from './business/utils/pathfinderAnimation.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import socketService from './presentation/socket/socketService.js';

const app = express();

let server;

const gracefulShutdown = async signal => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');

      try {
        await disconnectFromDatabase();
        console.log('Database connections closed.');
      } catch (err) {
        console.error('Error during database shutdown:', err);
      }

      try {
        await disconnectFromRedis();
        console.log('Redis connections closed.');
      } catch (err) {
        console.error('Error during Redis shutdown:', err);
      }

      stopAnimation();
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

connectToDatabase()
  .then(() => {})
  .catch(err => {
    console.error('Failed to connect to database:', err);
    if (Environment.isProduction) {
      process.exit(1);
    }
  });

if (Environment.REDIS_URL) {
  connectToRedis()
    .then(() => {})
    .catch(err => {
      console.error('Failed to connect to Redis:', err);
    });
} else {
  console.log('Redis not configured, using in-memory rate limiting');
}

configureMiddleware(app);

app.get('/api', (req, res) =>
  res.json({
    success: true,
    message: 'Welcome to the PathFinder API',
    version: '1.0.0',
    docs: '/api-docs',
  })
);

app.get('/', (req, res) =>
  res.json({
    success: true,
    message: 'Welcome to the PathFinder API',
    version: '1.0.0',
    docs: '/api-docs',
  })
);

app.get('/api/health', async (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const dbState = getConnectionState();
  const redisState = await redisHealthCheck();

  const checks = {
    database: dbState.isConnected ? 'up' : 'down',
    redis: redisState.status,
  };

  const allHealthy = checks.database === 'up';

  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    version: '1.0.0',
    environment: Environment.NODE_ENV,
    services: checks,
    memory: {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
    },
  });
});

app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const dbState = getConnectionState();

  const checks = {
    database: dbState.isConnected ? 'up' : 'down',
  };

  const allHealthy = checks.database === 'up';

  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    version: '1.0.0',
    environment: Environment.NODE_ENV,
    services: checks,
    memory: {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
    },
  });
});

app.use('/api', routes);
app.use('/', routes);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PathFinder API',
      version: '1.0.0',
      description: 'API para búsqueda de rutas óptimas con waypoints y obstáculos',
      contact: {
        name: 'Carlos Garcia',
        email: 'carlos@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${Environment.PORT}`,
        description: `Development server (${Environment.NODE_ENV})`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        apiKey: [],
      },
    ],
    tags: [
      { name: 'Users', description: 'User authentication and management' },
      { name: 'Maps', description: 'Map management' },
      { name: 'Waypoints', description: 'Waypoint management' },
      { name: 'Obstacles', description: 'Obstacle management' },
      { name: 'Routes', description: 'Route management' },
      { name: 'Stats', description: 'API statistics and tracking' },
    ],
  },
  apis: ['./src/presentation/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PathFinder API Docs',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  })
);

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

app.use('*', (req, res, next) => {
  const error = new NotFoundError(req.originalUrl);
  next(error);
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  const httpServer = createServer(app);
  socketService.initialize(httpServer);
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${Environment.NODE_ENV} mode`);
    displayWelcomeMessage();
  });
}

process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  stopAnimation();
  gracefulShutdown('UNHANDLED REJECTION');
});

process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  stopAnimation();
  gracefulShutdown('UNCAUGHT EXCEPTION');
});

export default app;
