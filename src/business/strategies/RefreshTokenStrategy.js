import { Either } from '../utils/either/Either.js';
import jwt from 'jsonwebtoken';
import Environment from '../../data/config/environment.js';

const RefreshTokenStrategy = {
  generateToken: (userId) =>
    Either.tryCatch(() =>
      jwt.sign({ userId }, Environment.REFRESH_TOKEN_SECRET, {
        expiresIn: Environment.REFRESH_TOKEN_EXPIRES_IN,
      })
    ),

  verifyToken: (token) =>
    Either.tryCatch(() => jwt.verify(token, Environment.REFRESH_TOKEN_SECRET)),
};

export default RefreshTokenStrategy;