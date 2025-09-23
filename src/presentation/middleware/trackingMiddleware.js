import { performance } from "node:perf_hooks";
import TrackingService from "../../business/services/TrackingService.js";

/**
 * Middleware for tracking and logging HTTP request performance data.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The function to move to the next middleware.
 */
export const trackRequests = (req, res, next) => {
    const start = performance.now();

    res.on("finish", async () => {
        const responseTime = performance.now() - start;

        const trackingData = {
            endpointAccess: req.originalUrl,
            requestMethod: req.method,
            statusCode: res.statusCode,
            responseTime: { avg: responseTime, min: responseTime, max: responseTime },
            requestCount: 1,
            timestamp: new Date().toISOString(),
            userId: req.user ? req.user.id : null,
        };

        const result = await TrackingService.addTrackingRecord(trackingData);
    });

    next();
};
