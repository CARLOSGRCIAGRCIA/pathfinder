import ApiKey from '../../data/models/ApiKey.js';
import { Either } from '../utils/either/Either.js';
import { AppError } from '../utils/errorUtils.js';

const createApiKey = async (userId, data) => {
  try {
    const apiKey = new ApiKey({
      user: userId,
      name: data.name,
      description: data.description,
      expiresAt: data.expiresAt,
      permissions: data.permissions,
      rateLimit: data.rateLimit || 100,
    });

    await apiKey.save();
    return Either.right(apiKey);
  } catch (error) {
    if (error.code === 11000) {
      return Either.left(new AppError('API Key name already exists', 409, 'DUPLICATE_KEY_NAME'));
    }
    throw error;
  }
};

const getApiKeys = async (userId, options = {}) => {
  const { page = 1, limit = 20 } = options;

  const query = { user: userId };
  const skip = (page - 1) * limit;

  const [keys, total] = await Promise.all([
    ApiKey.find(query).select('-key').skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
    ApiKey.countDocuments(query),
  ]);

  return Either.right({
    keys,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

const getApiKeyById = async (keyId, userId) => {
  const key = await ApiKey.findOne({ _id: keyId, user: userId });

  if (!key) {
    return Either.left(new AppError('API Key not found', 404, 'API_KEY_NOT_FOUND'));
  }

  return Either.right(key);
};

const getFullApiKey = async (keyId, userId) => {
  const key = await ApiKey.findOne({ _id: keyId, user: userId });

  if (!key) {
    return Either.left(new AppError('API Key not found', 404, 'API_KEY_NOT_FOUND'));
  }

  return Either.right(key);
};

const deleteApiKey = async (keyId, userId) => {
  const result = await ApiKey.deleteOne({ _id: keyId, user: userId });

  if (result.deletedCount === 0) {
    return Either.left(new AppError('API Key not found', 404, 'API_KEY_NOT_FOUND'));
  }

  return Either.right({ message: 'API Key deleted successfully' });
};

const verifyApiKey = async apiKey => {
  const key = await ApiKey.findOne({ key: apiKey, isActive: true });

  if (!key) {
    return Either.left(new AppError('Invalid API Key', 401, 'INVALID_API_KEY'));
  }

  if (key.isExpired()) {
    return Either.left(new AppError('API Key expired', 401, 'API_KEY_EXPIRED'));
  }

  await key.incrementUsage();

  return Either.right(key);
};

const toggleApiKey = async (keyId, userId) => {
  const key = await ApiKey.findOne({ _id: keyId, user: userId });

  if (!key) {
    return Either.left(new AppError('API Key not found', 404, 'API_KEY_NOT_FOUND'));
  }

  key.isActive = !key.isActive;
  await key.save();

  return Either.right(key);
};

export default {
  createApiKey,
  getApiKeys,
  getApiKeyById,
  getFullApiKey,
  deleteApiKey,
  verifyApiKey,
  toggleApiKey,
};
