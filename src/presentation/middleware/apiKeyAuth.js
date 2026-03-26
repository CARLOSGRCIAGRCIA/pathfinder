import apiKeyService from '../services/apiKeyService.js';
import Environment from '../../data/config/environment.js';
import { AppError } from '../../business/utils/errorUtils.js';

export const apiKeyAuth = async (req, res, next) => {
  if (!Environment.API_KEY_ENABLED) {
    return next();
  }

  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    return next();
  }

  const result = await apiKeyService.verifyApiKey(apiKey);

  result.fold(
    error => next(error),
    key => {
      req.apiKey = key;
      req.user = key.user;
      next();
    }
  );
};

export const requireApiKey = (req, res, next) => {
  if (!Environment.API_KEY_ENABLED) {
    return next();
  }

  if (!req.apiKey) {
    return next(new AppError('API Key required', 401, 'API_KEY_REQUIRED'));
  }

  next();
};
