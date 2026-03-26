import express from 'express';
import { auth, requireAdmin, requirePermission } from '../middleware/auth.js';
import { PERMISSIONS } from '../../data/models/User.js';
import analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

router.get(
  '/overview',
  auth,
  requirePermission(PERMISSIONS.STATS.READ),
  analyticsController.getOverview
);
router.get(
  '/endpoints',
  auth,
  requirePermission(PERMISSIONS.STATS.READ),
  analyticsController.getEndpoints
);
router.get(
  '/performance',
  auth,
  requirePermission(PERMISSIONS.STATS.READ),
  analyticsController.getPerformance
);
router.get(
  '/errors',
  auth,
  requirePermission(PERMISSIONS.STATS.READ),
  analyticsController.getErrors
);

export default router;
