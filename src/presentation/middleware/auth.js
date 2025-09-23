import { AppError } from '../../business/utils/errorUtils.js';
import User from '../../data/models/User.js';
import authService from '../../business/services/authService.js';

export const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return next(AppError('Please authenticate', 401));
  }

  const decodedResult = await authService.verifyToken(token);
  decodedResult.fold(
    (error) => next(AppError('Please authenticate', 401)),
    async (decoded) => {
      const user = await User.findOne({ _id: decoded.userId });
      if (!user) {
        return next(AppError('Authentication failed', 401));
      }
      req.user = user;
      req.token = token;
      next();
    }
  );
};