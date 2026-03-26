import express from 'express';
import {
  validate,
  validateObstacle,
  obstacleValidation,
  validateIdFormat,
  validateIdExistence,
} from '../../business/utils/validationUtils.js';
import ObstacleController from '../controllers/obstacleController.js';
import ObstacleService from '../../business/services/obstacleService.js';
import ObstacleRepository from '../../data/repositories/obstacleRepository.js';
import { auth } from '../middleware/auth.js';
import Map from '../../data/models/Map.js';
import Obstacle from '../../data/models/Obstacle.js';

const router = express.Router();
const obstacleRepository = ObstacleRepository;
const obstacleService = ObstacleService;

const mapIdValidator = validateIdFormat('mapId', 'Invalid map ID format');
const obstacleIdValidator = validateIdFormat('obstacleId', 'Invalid obstacle ID format');

const mapExistenceValidation = validateIdExistence('mapId', Map, 'Map ID does not exist');
const obstacleExistenceValidation = validateIdExistence(
  'obstacleId',
  Obstacle,
  'Obstacle ID does not exist'
);

/**
 * @swagger
 * /obstacles/{mapId}:
 *   post:
 *     tags: [Obstacles]
 *     summary: Create an obstacle for a map
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mapId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - x
 *               - y
 *               - size
 *             properties:
 *               x:
 *                 type: integer
 *                 example: 50
 *               y:
 *                 type: integer
 *                 example: 50
 *               size:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Obstacle created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:mapId',
  auth,
  validate([mapIdValidator, mapExistenceValidation, ...obstacleValidation]),
  ObstacleController.createObstacle(obstacleService)
);

/**
 * @swagger
 * /obstacles/{mapId}:
 *   get:
 *     tags: [Obstacles]
 *     summary: Get obstacles by map ID
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
 *         description: List of obstacles
 *       404:
 *         description: Map not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:mapId',
  auth,
  validate([mapIdValidator, mapExistenceValidation]),
  ObstacleController.getObstacles(obstacleService)
);

/**
 * @swagger
 * /obstacles/{mapId}/{obstacleId}:
 *   put:
 *     tags: [Obstacles]
 *     summary: Update an obstacle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mapId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: obstacleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               x:
 *                 type: integer
 *               y:
 *                 type: integer
 *               size:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Obstacle updated
 *       404:
 *         description: Obstacle not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/:mapId/:obstacleId',
  auth,
  validate([
    mapIdValidator,
    obstacleIdValidator,
    mapExistenceValidation,
    obstacleExistenceValidation,
    ...validateObstacle,
  ]),
  ObstacleController.updateObstacle(obstacleService)
);

/**
 * @swagger
 * /obstacles/{mapId}/{obstacleId}:
 *   delete:
 *     tags: [Obstacles]
 *     summary: Delete an obstacle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mapId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: obstacleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Obstacle deleted
 *       404:
 *         description: Obstacle not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/:mapId/:obstacleId',
  auth,
  validate([
    mapIdValidator,
    obstacleIdValidator,
    mapExistenceValidation,
    obstacleExistenceValidation,
  ]),
  ObstacleController.deleteObstacle(obstacleService)
);

export default router;
