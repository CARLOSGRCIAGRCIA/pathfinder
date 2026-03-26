import express from 'express';
import {
  validate,
  validateWaypoints,
  waypointValidation,
  validateIdFormat,
  validateIdExistence,
} from '../../business/utils/validationUtils.js';
import WaypointController from '../controllers/waypointController.js';
import WaypointService from '../../business/services/waypointService.js';
import WaypointRepository from '../../data/repositories/waypointRepository.js';
import { auth } from '../middleware/auth.js';
import Map from '../../data/models/Map.js';
import Waypoint from '../../data/models/Waypoint.js';

const router = express.Router();
const waypointRepository = WaypointRepository;
const waypointService = WaypointService;

const mapIdValidator = validateIdFormat('mapId', 'Invalid map ID format');
const waypointIdValidator = validateIdFormat('waypointId', 'Invalid waypoint ID format');

const mapExistenceValidation = validateIdExistence('mapId', Map, 'Map ID does not exist');
const waypointExistenceValidation = validateIdExistence(
  'waypointId',
  Waypoint,
  'Waypoint ID does not exist'
);

/**
 * @swagger
 * /waypoints/{mapId}:
 *   post:
 *     tags: [Waypoints]
 *     summary: Create waypoints for a map
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
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   x:
 *                     type: integer
 *                   y:
 *                     type: integer
 *               - type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     x:
 *                       type: integer
 *                     y:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Waypoints created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:mapId',
  auth,
  validate([mapIdValidator, mapExistenceValidation, ...waypointValidation]),
  WaypointController.createWaypoint(waypointService)
);

/**
 * @swagger
 * /waypoints/{mapId}:
 *   get:
 *     tags: [Waypoints]
 *     summary: Get waypoints by map ID
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
 *         description: List of waypoints
 *       404:
 *         description: Map not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:mapId',
  auth,
  validate([mapIdValidator, mapExistenceValidation]),
  WaypointController.getWaypoints(waypointService)
);

/**
 * @swagger
 * /waypoints/{mapId}/{waypointId}:
 *   put:
 *     tags: [Waypoints]
 *     summary: Update a waypoint
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mapId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: waypointId
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
 *     responses:
 *       200:
 *         description: Waypoint updated
 *       404:
 *         description: Waypoint not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/:mapId/:waypointId',
  auth,
  validate([
    mapIdValidator,
    waypointIdValidator,
    mapExistenceValidation,
    waypointExistenceValidation,
    ...validateWaypoints,
  ]),
  WaypointController.updateWaypoint(waypointService)
);

/**
 * @swagger
 * /waypoints/{mapId}/{waypointId}:
 *   delete:
 *     tags: [Waypoints]
 *     summary: Delete a waypoint
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mapId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: waypointId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Waypoint deleted
 *       404:
 *         description: Waypoint not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/:mapId/:waypointId',
  auth,
  validate([
    mapIdValidator,
    waypointIdValidator,
    mapExistenceValidation,
    waypointExistenceValidation,
  ]),
  WaypointController.deleteWaypoint(waypointService)
);

export default router;
