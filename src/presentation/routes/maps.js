import express from 'express';
import MapController from '../controllers/mapController.js';
import MapService from '../../business/services/mapService.js';
import MapRepository from '../../data/repositories/mapRepository.js';
import NameSearchStrategy from '../../business/strategies/NameSearchStrategy.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const mapRepository = MapRepository;
const searchStrategy = NameSearchStrategy;
const mapService = MapService(mapRepository, searchStrategy);

/**
 * @swagger
 * /maps:
 *   get:
 *     tags: [Maps]
 *     summary: Get all maps
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of maps
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, MapController.getAllMaps(mapService));

/**
 * @swagger
 * /maps:
 *   post:
 *     tags: [Maps]
 *     summary: Create a new map
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - width
 *               - height
 *               - start
 *               - end
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My Map"
 *               width:
 *                 type: integer
 *                 example: 100
 *               height:
 *                 type: integer
 *                 example: 100
 *               start:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: integer
 *                   y:
 *                     type: integer
 *               end:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: integer
 *                   y:
 *                     type: integer
 *     responses:
 *       201:
 *         description: Map created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, MapController.createMap(mapService));

/**
 * @swagger
 * /maps/{mapId}:
 *   get:
 *     tags: [Maps]
 *     summary: Get a map by ID
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
 *         description: Map data
 *       404:
 *         description: Map not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:mapId', auth, MapController.getMap(mapService));

/**
 * @swagger
 * /maps/{mapId}:
 *   put:
 *     tags: [Maps]
 *     summary: Update a map
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
 *             properties:
 *               name:
 *                 type: string
 *               width:
 *                 type: integer
 *               height:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Map updated
 *       404:
 *         description: Map not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:mapId', auth, MapController.updateMap(mapService));

/**
 * @swagger
 * /maps/{mapId}:
 *   delete:
 *     tags: [Maps]
 *     summary: Delete a map
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mapId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Map deleted
 *       404:
 *         description: Map not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:mapId', auth, MapController.deleteMap(mapService));

export default router;
