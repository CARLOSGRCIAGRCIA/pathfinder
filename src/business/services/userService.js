import { Either } from '../utils/either/Either.js';
import { AppError } from '../utils/errorUtils.js';
import User from '../../data/models/User.js';
import authService from './authService.js';

const register = async (userData) => {
  const newUser = new User(userData);
  const savedUser = await newUser.save();
  const tokenResult = await authService.generateToken(savedUser._id);

  return tokenResult.map((token) => ({ user: savedUser, token }));
};

const login = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return Either.left(AppError('Invalid credentials', 401));
  }

  const accessTokenResult = await authService.generateToken(user._id);
  const refreshTokenResult = await authService.generateRefreshToken(user._id);

  return accessTokenResult.flatMap((accessToken) =>
    refreshTokenResult.map((refreshToken) => ({
      user,
      accessToken,
      refreshToken,
    }))
  );
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    return Either.left(AppError('User not found', 404));
  }
  return Either.right(user);
};

const refreshUserToken = async (refreshToken) => {
  return authService.refreshToken(refreshToken);
};

export default {
  register,
  login,
  getProfile,
  refreshUserToken,
};