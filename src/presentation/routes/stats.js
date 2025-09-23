import express from "express";
import { auth } from "../middleware/auth.js";
import TrackingController from "../controllers/trackingController.js";

const router = express.Router();

router.get("/requests", auth, TrackingController.getRequestStats);
router.get("/response-times", auth, TrackingController.getResponseTimes);
router.get("/status-codes", auth, TrackingController.getStatusCodes);
router.get("/popular-endpoints", auth, TrackingController.getPopularEndpoints);
router.post("/track", auth, TrackingController.addTrackingRecord);

export default router;
