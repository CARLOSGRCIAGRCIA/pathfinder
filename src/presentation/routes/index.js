import express from 'express';
import mapRoutes from './maps.js';
import obstacleRoutes from './obstacles.js';
import routeRoutes from './routes.js';
import userRoutes from './users.js';
import waypointRoutes from './waypoints.js';
import statsRoutes from './stats.js';

const router = express.Router();

router.use('/maps', mapRoutes);
router.use('/obstacles', obstacleRoutes);
router.use('/routes', routeRoutes);
router.use('/users', userRoutes);
router.use('/waypoints', waypointRoutes);
router.use('/stats', statsRoutes);

export default router;