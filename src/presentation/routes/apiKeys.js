import express from 'express';
import { auth, requireAdmin } from '../middleware/auth.js';
import {
  createApiKey,
  getApiKeys,
  getApiKey,
  deleteApiKey,
  regenerateApiKey,
  toggleApiKey,
} from '../controllers/apiKeyController.js';
import { PERMISSIONS } from '../../data/models/User.js';

const router = express.Router();

router.post('/', auth, requireAdmin, createApiKey);

router.get('/', auth, getApiKeys);

router.get('/:keyId', auth, getApiKey);

router.delete('/:keyId', auth, deleteApiKey);

router.post('/:keyId/regenerate', auth, regenerateApiKey);

router.patch('/:keyId/toggle', auth, toggleApiKey);

export default router;
