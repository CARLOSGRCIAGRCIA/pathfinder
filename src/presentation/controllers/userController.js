import userService from '../../business/services/userService.js';
import { USER_ROLES, PERMISSIONS } from '../../data/models/User.js';

const handleResult = (result, res, status = 200) => {
  result.fold(
    error =>
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        code: error.code,
      }),
    data =>
      res.status(status).json({
        success: true,
        ...data,
      })
  );
};

export const registerUser = async (req, res, next) => {
  const result = await userService.register(req.body);
  result.fold(
    error => next(error),
    data =>
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: data.user,
        token: data.token,
      })
  );
};

export const loginUser = async (req, res, next) => {
  const { username, password } = req.body;
  const result = await userService.login(username, password);
  result.fold(
    error => next(error),
    data =>
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      })
  );
};

export const getUserProfile = async (req, res, next) => {
  const result = await userService.getProfile(req.user._id);
  result.fold(
    error => next(error),
    user =>
      res.json({
        success: true,
        data: user,
      })
  );
};

export const updateUserProfile = async (req, res, next) => {
  const result = await userService.updateProfile(req.user._id, req.body);
  result.fold(
    error => next(error),
    user =>
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      })
  );
};

export const getAllUsers = async (req, res, next) => {
  const { page, limit, role, isActive } = req.query;
  const options = {
    page: parseInt(page, 10) || 1,
    limit: Math.min(parseInt(limit, 10) || 20, 100),
    role,
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
  };

  const result = await userService.getAllUsers(options);
  result.fold(
    error => next(error),
    data =>
      res.json({
        success: true,
        ...data,
      })
  );
};

export const updateUserRole = async (req, res, next) => {
  const { userId } = req.params;
  const { role } = req.body;

  const result = await userService.updateUserRole(userId, role);
  result.fold(
    error => next(error),
    user =>
      res.json({
        success: true,
        message: 'User role updated successfully',
        data: user,
      })
  );
};

export const toggleUserActive = async (req, res, next) => {
  const { userId } = req.params;
  const result = await userService.toggleUserActive(userId);
  result.fold(
    error => next(error),
    user =>
      res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: user,
      })
  );
};

export const deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  const result = await userService.deleteUser(userId);
  result.fold(
    error => next(error),
    () =>
      res.json({
        success: true,
        message: 'User deleted successfully',
      })
  );
};

export const refreshUserTokenHandler = async (req, res, next) => {
  const { refreshToken } = req.body;
  const result = await userService.refreshUserToken(refreshToken);
  result.fold(
    error => next(error),
    tokens =>
      res.json({
        success: true,
        data: tokens,
      })
  );
};

export const getCurrentUserStats = async (req, res) => {
  res.json({
    success: true,
    data: {
      role: req.user.role,
      permissions: PERMISSIONS,
      isAdmin: req.user.role === USER_ROLES.ADMIN,
    },
  });
};
