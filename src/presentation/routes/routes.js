import express from 'express';
import {
  validate,
  validateIdFormat,
  validateStoppingPoints,
  checkReachability,
  validateComplexGeometry,
  validateAllRoutes,
  validateOptimalRoute,
  validateInput,
  validateLargeMap,
} from '../../business/utils/validationUtils.js';
import RouteController from '../controllers/routeController.js';
import createRouteService from '../../business/services/routeService.js';
import RouteRepository from '../../data/repositories/routeRepository.js';
import MapRepository from '../../data/repositories/mapRepository.js';
import ObstacleRepository from '../../data/repositories/obstacleRepository.js';
import WaypointRepository from '../../data/repositories/waypointRepository.js';
import { auth } from '../middleware/auth.js';
import { injectUserId } from '../middleware/injectUserId.js';

const router = express.Router();

const routeRepository = RouteRepository;
const mapRepository = MapRepository;
const obstacleRepository = ObstacleRepository;
const waypointRepository = WaypointRepository;

const routeService = createRouteService(
  routeRepository,
  mapRepository,
  obstacleRepository,
  waypointRepository
);

/**
 * @swagger
 * /routes/validateMap/{mapId}:
 *   post:
 *     tags: [Routes]
 *     summary: Validate map stopping points
 *     parameters:
 *       - in: path
 *         name: mapId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Validation successful
 *       400:
 *         description: Validation error
 */
router.post('/validateMap/:mapId', validate([validateIdFormat('mapId')]), async (req, res) => {
  const result = await validateStoppingPoints(req.params.mapId);
  result.fold(
    error => res.status(400).json(error),
    success => res.status(200).json(success)
  );
});

/**
 * @swagger
 * /routes/checkReachability/{mapId}:
 *   post:
 *     tags: [Routes]
 *     summary: Check if all points are reachable
 *     parameters:
 *       - in: path
 *         name: mapId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Check successful
 *       400:
 *         description: Check failed
 */
router.post(
  '/checkReachability/:mapId',
  validate([validateIdFormat('mapId')]),
  async (req, res) => {
    const result = await checkReachability(req.params.mapId);
    result.fold(
      error => res.status(400).json(error),
      success => res.status(200).json(success)
    );
  }
);

/**
 * @swagger
 * /routes/{mapId}:
 *   post:
 *     tags: [Routes]
 *     summary: Find optimal route for a map
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mapId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Optimal route found
 *       400:
 *         description: Error finding route
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:mapId',
  auth,
  injectUserId(),
  validate([validateIdFormat('mapId')]),
  RouteController.findOptimalRoute(routeService)
);

/**
 * @swagger
 * /routes/map/{mapId}:
 *   get:
 *     tags: [Routes]
 *     summary: Get routes by map ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mapId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of routes
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/map/:mapId',
  auth,
  validate([validateIdFormat('mapId')]),
  RouteController.getRoutesByMapId(routeService)
);

/**
 * @swagger
 * /routes:
 *   get:
 *     tags: [Routes]
 *     summary: Get all routes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all routes
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, RouteController.getAllRoutes(routeService));

/**
 * @swagger
 * /routes/{routeId}:
 *   get:
 *     tags: [Routes]
 *     summary: Get a route by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Route data
 *       404:
 *         description: Route not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:routeId', auth, RouteController.getRoute(routeService));

/**
 * @swagger
 * /routes/{routeId}:
 *   delete:
 *     tags: [Routes]
 *     summary: Delete a route
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Route deleted
 *       404:
 *         description: Route not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:routeId', auth, RouteController.deleteRoute(routeService));

export default router;
