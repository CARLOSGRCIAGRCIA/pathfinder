import apiKeyService from '../../business/services/apiKeyService.js';
import { PERMISSIONS } from '../../data/models/User.js';

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

export const createApiKey = async (req, res, next) => {
  const result = await apiKeyService.createApiKey(req.user._id, {
    name: req.body.name,
    description: req.body.description,
    expiresAt: req.body.expiresAt,
    permissions: req.body.permissions || Object.values(PERMISSIONS).flatMap(p => Object.values(p)),
    rateLimit: req.body.rateLimit,
  });

  result.fold(
    error => next(error),
    key =>
      res.status(201).json({
        success: true,
        message: 'API Key created successfully',
        data: key,
      })
  );
};

export const getApiKeys = async (req, res, next) => {
  const { page, limit } = req.query;
  const result = await apiKeyService.getApiKeys(req.user._id, {
    page: parseInt(page, 10) || 1,
    limit: Math.min(parseInt(limit, 10) || 20, 100),
  });

  result.fold(
    error => next(error),
    data =>
      res.json({
        success: true,
        ...data,
      })
  );
};

export const getApiKey = async (req, res, next) => {
  const result = await apiKeyService.getApiKeyById(req.params.keyId, req.user._id);
  result.fold(
    error => next(error),
    key =>
      res.json({
        success: true,
        data: key,
      })
  );
};

export const deleteApiKey = async (req, res, next) => {
  const result = await apiKeyService.deleteApiKey(req.params.keyId, req.user._id);
  result.fold(
    error => next(error),
    () =>
      res.json({
        success: true,
        message: 'API Key deleted successfully',
      })
  );
};

export const regenerateApiKey = async (req, res, next) => {
  const result = await apiKeyService.deleteApiKey(req.params.keyId, req.user._id);

  result.fold(
    error => next(error),
    async () => {
      const newKeyResult = await apiKeyService.createApiKey(req.user._id, {
        name: `${req.body.name || 'Regenerated Key'}`,
        description: req.body.description,
        expiresAt: req.body.expiresAt,
        permissions: req.body.permissions,
      });

      newKeyResult.fold(
        error => next(error),
        key =>
          res.status(201).json({
            success: true,
            message: 'API Key regenerated successfully',
            data: key,
          })
      );
    }
  );
};

export const toggleApiKey = async (req, res, next) => {
  const result = await apiKeyService.toggleApiKey(req.params.keyId, req.user._id);
  result.fold(
    error => next(error),
    key =>
      res.json({
        success: true,
        message: `API Key ${key.isActive ? 'activated' : 'deactivated'} successfully`,
        data: key,
      })
  );
};
