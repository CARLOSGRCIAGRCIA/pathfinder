import dotenv from "dotenv";
dotenv.config();

class Environment {
  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || "development";
    this.PORT = process.env.PORT || 3000;
    this.MONGODB_URI = process.env.MONGODB_URI;
    this.JWT_SECRET = process.env.JWT_SECRET;
    this.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
    this.REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
    this.REDIS_URL = process.env.REDIS_URL;
  }
}

export default new Environment();