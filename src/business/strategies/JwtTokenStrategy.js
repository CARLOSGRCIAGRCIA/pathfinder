import { Either } from '../utils/either/Either.js';
import jwt from 'jsonwebtoken';
import Environment from '../../data/config/environment.js';

const JwtTokenStrategy = {
  generateToken: (userId) =>
    Either.tryCatch(() =>
      jwt.sign({ userId }, Environment.JWT_SECRET, {
        expiresIn: Environment.JWT_EXPIRES_IN,
      })
    ),

  verifyToken: (token) =>
    Either.tryCatch(() => jwt.verify(token, Environment.JWT_SECRET)),
};

export default JwtTokenStrategy;