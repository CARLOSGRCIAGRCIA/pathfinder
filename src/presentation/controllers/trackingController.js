import { Either } from '../../business/utils/either/Either.js';
import TrackingService from '../../business/services/TrackingService.js';

const TrackingController = {
  getRequestStats: async (req, res) => {
    const userId = req.user._id;

    const result = await TrackingService.getRequestStats(userId);
    result.fold(
      error => {
        res.status(500).json({ message: error.message });
      },
      stats => {
        res.json(stats);
      }
    );
  },

  getResponseTimes: async (req, res) => {
    const userId = req.user._id;
    const result = await TrackingService.getResponseTimes(userId);
    result.fold(
      error => {
        res.status(500).json({ message: error.message });
      },
      responseTimes => {
        res.json(responseTimes);
      }
    );
  },

  getStatusCodes: async (req, res) => {
    const userId = req.user._id;

    const result = await TrackingService.getStatusCodes(userId);
    result.fold(
      error => {
        res.status(500).json({ message: error.message });
      },
      statusCodes => {
        res.json(statusCodes);
      }
    );
  },

  getPopularEndpoints: async (req, res) => {
    const userId = req.user._id;
    const result = await TrackingService.getPopularEndpoints(userId);
    result.fold(
      error => {
        res.status(500).json({ message: error.message });
      },
      popularEndpoints => {
        res.json(popularEndpoints);
      }
    );
  },

  addTrackingRecord: async (req, res) => {
    const trackingData = {
      ...req.body,
      userId: req.user._id,
    };
    const result = await TrackingService.addTrackingRecord(trackingData);
    result.fold(
      error => {
        res.status(500).json({ message: error.message });
      },
      newRecord => {
        res.status(201).json(newRecord);
      }
    );
  },
};

export default TrackingController;
