import { Either } from '../utils/either/Either.js';
import { AppError } from '../utils/errorUtils.js';
import { validatePassword, validateUsername } from '../utils/validationUtils.js';
import User, { USER_ROLES } from '../../data/models/User.js';
import authService from './authService.js';

const register = async userData => {
  try {
    if (userData.password) {
      const passwordValidation = validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        return Either.left(
          new AppError(
            `Password is too weak. Requirements: ${passwordValidation.errors.join(', ')}`,
            400,
            'WEAK_PASSWORD'
          )
        );
      }
    }

    if (userData.username) {
      const usernameValidation = validateUsername(userData.username);
      if (!usernameValidation.isValid) {
        return Either.left(
          new AppError(
            `Invalid username. Requirements: ${usernameValidation.errors.join(', ')}`,
            400,
            'INVALID_USERNAME'
          )
        );
      }
    }

    const userToCreate = {
      ...userData,
      role: userData.role || USER_ROLES.USER,
    };

    const newUser = new User(userToCreate);
    const savedUser = await newUser.save();
    const tokenResult = await authService.generateToken(savedUser._id);

    return tokenResult.map(token => ({ user: savedUser, token }));
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return Either.left(
        new AppError(`User with this ${field} already exists`, 409, 'DUPLICATE_FIELD')
      );
    }
    throw error;
  }
};

const login = async (username, password) => {
  const user = await User.findOne({ username, isActive: true });

  if (!user) {
    return Either.left(new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS'));
  }

  if (!(await user.comparePassword(password))) {
    return Either.left(new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS'));
  }

  user.lastLogin = new Date();
  await user.save();

  const accessTokenResult = await authService.generateToken(user._id);
  const refreshTokenResult = await authService.generateRefreshToken(user._id);

  return accessTokenResult.flatMap(accessToken =>
    refreshTokenResult.map(refreshToken => ({
      user,
      accessToken,
      refreshToken,
    }))
  );
};

const getProfile = async userId => {
  const user = await User.findById(userId);
  if (!user) {
    return Either.left(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }
  return Either.right(user);
};

const updateProfile = async (userId, updates) => {
  const allowedUpdates = ['preferences', 'avatar', 'bio'];
  const filteredUpdates = {};

  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: filteredUpdates },
    { new: true, runValidators: true }
  );

  if (!user) {
    return Either.left(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  return Either.right(user);
};

const getAllUsers = async (options = {}) => {
  const { page = 1, limit = 20, role, isActive } = options;

  const query = {};

  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
    User.countDocuments(query),
  ]);

  return Either.right({
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

const updateUserRole = async (userId, newRole) => {
  if (!Object.values(USER_ROLES).includes(newRole)) {
    return Either.left(new AppError('Invalid role', 400, 'INVALID_ROLE'));
  }

  const user = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true }).select(
    '-password'
  );

  if (!user) {
    return Either.left(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  return Either.right(user);
};

const toggleUserActive = async userId => {
  const user = await User.findById(userId);

  if (!user) {
    return Either.left(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  user.isActive = !user.isActive;
  await user.save();

  return Either.right(user);
};

const deleteUser = async userId => {
  const user = await User.findById(userId);

  if (!user) {
    return Either.left(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  await User.findByIdAndDelete(userId);
  return Either.right({ message: 'User deleted successfully' });
};

const refreshUserToken = async refreshToken => {
  return authService.refreshToken(refreshToken);
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
  toggleUserActive,
  deleteUser,
  refreshUserToken,
};
