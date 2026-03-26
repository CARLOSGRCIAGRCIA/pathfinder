import { createClient } from 'redis';
import Environment from './environment.js';

let redisClient = null;
let isConnected = false;

export const connectToRedis = async () => {
  if (!Environment.REDIS_URL) {
    console.warn('Redis URL not configured, skipping Redis connection');
    return null;
  }

  try {
    redisClient = createClient({
      url: Environment.REDIS_URL,
      socket: {
        reconnectStrategy: retries => {
          if (retries > 10) {
            console.error('Max Redis reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on('error', err => {
      console.error('Redis Client Error:', err.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
      isConnected = true;
    });

    redisClient.on('disconnect', () => {
      console.warn('Redis disconnected');
      isConnected = false;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error.message);
    return null;
  }
};

export const disconnectFromRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      isConnected = false;
      console.log('Redis disconnected');
    } catch (error) {
      console.error('Error disconnecting from Redis:', error.message);
    }
  }
};

export const getRedisClient = () => redisClient;

export const isRedisConnected = () => isConnected && redisClient?.isOpen;

export const redisHealthCheck = async () => {
  if (!isRedisConnected()) {
    return { status: 'down', latency: null };
  }

  try {
    const start = Date.now();
    await redisClient.ping();
    const latency = Date.now() - start;
    return { status: 'up', latency };
  } catch (error) {
    return { status: 'down', latency: null, error: error.message };
  }
};

export default {
  connectToRedis,
  disconnectFromRedis,
  getRedisClient,
  isRedisConnected,
  redisHealthCheck,
};
