import express from 'express';
import { auth } from '../middleware/auth.js';
import TrackingController from '../controllers/trackingController.js';

const router = express.Router();

/**
 * @swagger
 * /stats/requests:
 *   get:
 *     tags: [Stats]
 *     summary: Get request statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Request statistics data
 *       401:
 *         description: Unauthorized
 */
router.get('/requests', auth, TrackingController.getRequestStats);

/**
 * @swagger
 * /stats/response-times:
 *   get:
 *     tags: [Stats]
 *     summary: Get response times statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Response times data
 *       401:
 *         description: Unauthorized
 */
router.get('/response-times', auth, TrackingController.getResponseTimes);

/**
 * @swagger
 * /stats/status-codes:
 *   get:
 *     tags: [Stats]
 *     summary: Get status codes distribution
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status codes data
 *       401:
 *         description: Unauthorized
 */
router.get('/status-codes', auth, TrackingController.getStatusCodes);

/**
 * @swagger
 * /stats/popular-endpoints:
 *   get:
 *     tags: [Stats]
 *     summary: Get most popular endpoints
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Popular endpoints data
 *       401:
 *         description: Unauthorized
 */
router.get('/popular-endpoints', auth, TrackingController.getPopularEndpoints);

/**
 * @swagger
 * /stats/track:
 *   post:
 *     tags: [Stats]
 *     summary: Add a tracking record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endpoint:
 *                 type: string
 *               method:
 *                 type: string
 *               statusCode:
 *                 type: integer
 *               responseTime:
 *                 type: number
 *     responses:
 *       201:
 *         description: Tracking record created
 *       401:
 *         description: Unauthorized
 */
router.post('/track', auth, TrackingController.addTrackingRecord);

export default router;
