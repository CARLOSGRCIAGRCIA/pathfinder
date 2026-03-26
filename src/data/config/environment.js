import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

const envFiles = {
  production: '.env.production',
  development: '.env.development',
  test: '.env.test',
};

const currentEnv = process.env.NODE_ENV || 'development';
const envFile = envFiles[currentEnv];

if (envFile && existsSync(join(process.cwd(), envFile))) {
  dotenv.config({ path: envFile });
} else {
  dotenv.config();
}

const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET'];
const missingVars = requiredVars.filter(v => !process.env[v]);

if (missingVars.length > 0 && currentEnv !== 'test') {
  console.warn(`Warning: Missing required environment variables: ${missingVars.join(', ')}`);
}

class Environment {
  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.PORT = parseInt(process.env.PORT, 10) || 3000;
    this.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pathfinder';
    this.JWT_SECRET = process.env.JWT_SECRET;
    this.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
    this.REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

    this.RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
    this.RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;

    this.API_KEY_ENABLED = process.env.API_KEY_ENABLED === 'true';
    this.REDIS_URL = process.env.REDIS_URL || null;
    this.CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
    this.LOG_LEVEL = process.env.LOG_LEVEL || 'info';

    this.isProduction = this.NODE_ENV === 'production';
    this.isDevelopment = this.NODE_ENV === 'development';
    this.isTest = this.NODE_ENV === 'test';
  }

  validate() {
    const errors = [];

    if (!this.JWT_SECRET && this.NODE_ENV !== 'test') {
      errors.push('JWT_SECRET is required');
    }
    if (!this.REFRESH_TOKEN_SECRET && this.NODE_ENV !== 'test') {
      errors.push('REFRESH_TOKEN_SECRET is required');
    }
    if (!this.MONGODB_URI && this.NODE_ENV !== 'test') {
      errors.push('MONGODB_URI is required');
    }

    if (errors.length > 0) {
      throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

const env = new Environment();

try {
  env.validate();
} catch (e) {
  if (env.NODE_ENV !== 'test') {
    console.error(e.message);
  }
}

export default env;
