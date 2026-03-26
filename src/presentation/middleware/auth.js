import { AppError } from '../../business/utils/errorUtils.js';
import User, { USER_ROLES, ROLE_PERMISSIONS } from '../../data/models/User.js';
import authService from '../../business/services/authService.js';

export const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next(new AppError('Please authenticate', 401));
  }

  const decodedResult = await authService.verifyToken(token);

  decodedResult.fold(
    error => next(new AppError('Please authenticate', 401)),
    async decoded => {
      const user = await User.findOne({ _id: decoded.userId, isActive: true });
      if (!user) {
        return next(new AppError('Authentication failed', 401));
      }
      req.user = user;
      req.token = token;
      next();
    }
  );
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

export const requirePermission = permission => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const permissions = ROLE_PERMISSIONS[req.user.role] || [];

    if (!permissions.includes(permission)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

export const requireAdmin = requireRole(USER_ROLES.ADMIN);

export const optionalAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next();
  }

  const decodedResult = await authService.verifyToken(token);

  decodedResult.fold(
    () => next(),
    async decoded => {
      const user = await User.findOne({ _id: decoded.userId, isActive: true });
      if (user) {
        req.user = user;
        req.token = token;
      }
      next();
    }
  );
};
