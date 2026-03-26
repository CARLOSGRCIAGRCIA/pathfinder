import express from 'express';
import mapRoutes from './maps.js';
import obstacleRoutes from './obstacles.js';
import routeRoutes from './routes.js';
import userRoutes from './users.js';
import waypointRoutes from './waypoints.js';
import statsRoutes from './stats.js';
import apiKeyRoutes from './apiKeys.js';
import analyticsRoutes from './analytics.js';
import versionsRoutes from './versions.js';

const router = express.Router();

router.use('/maps', mapRoutes);
router.use('/obstacles', obstacleRoutes);
router.use('/routes', routeRoutes);
router.use('/users', userRoutes);
router.use('/waypoints', waypointRoutes);
router.use('/stats', statsRoutes);
router.use('/api-keys', apiKeyRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/versions', versionsRoutes);

export default router;
