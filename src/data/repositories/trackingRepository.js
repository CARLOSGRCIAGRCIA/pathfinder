import { Either } from "../../business/utils/either/Either.js";
import TrackingModel from "../models/trackingModel.js";
import ITrackingRepository from '../../business/repositories/ITrackingRepository.js';
import mongoose from 'mongoose';

const TrackingRepository = Object.assign({}, ITrackingRepository, {
  getRequestStats: async (userId) => {
    return Either.tryCatch(async () => {

      const userIdObjectId = new mongoose.Types.ObjectId(userId);

      const stats = await TrackingModel.aggregate([
        {
          $match: { userId: userIdObjectId }
        },
        {
          $group: {
            _id: {
              endpointAccess: "$endpointAccess",
              requestMethod: "$requestMethod"
            },
            requestCount: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.endpointAccess",
            breakdown: {
              $push: { method: "$_id.requestMethod", count: "$requestCount" }
            },
            total_requests: { $sum: "$requestCount" }
          }
        }
      ]);
      return stats;
    });
  },

  getResponseTimes: async (userId) => {
    return Either.tryCatch(async () => {
      const userIdObjectId = new mongoose.Types.ObjectId(userId);

      const responseTimes = await TrackingModel.aggregate([
        {
          $match: { userId: userIdObjectId }
        },
        {
          $group: {
            _id: "$endpointAccess",
            avg: { $avg: "$responseTime.avg" },
            min: { $min: "$responseTime.min" },
            max: { $max: "$responseTime.max" }
          }
        }
      ]);
      return responseTimes;
    });
  },

  getStatusCodes: async (userId) => {
    return Either.tryCatch(async () => {
      const userIdObjectId = new mongoose.Types.ObjectId(userId);

      const statusCodes = await TrackingModel.aggregate([
        {
          $match: { userId: userIdObjectId }
        },
        {
          $group: {
            _id: "$statusCode",
            count: { $sum: 1 }
          }
        }
      ]);
      return statusCodes;
    });
  },

  getPopularEndpoints: async (userId) => {
    return Either.tryCatch(async () => {
      const userIdObjectId = new mongoose.Types.ObjectId(userId);

      const popularEndpoints = await TrackingModel.aggregate([
        {
          $match: { userId: userIdObjectId }
        },
        {
          $group: {
            _id: "$endpointAccess",
            request_count: { $sum: 1 }
          }
        },
        {
          $sort: { request_count: -1 }
        },
        {
          $limit: 1
        }
      ]);
      return popularEndpoints[0] || {};
    });
  },

  addTrackingRecord: async (trackingData) => {
    return Either.tryCatch(async () => {
      const newRecord = new TrackingModel(trackingData);
      await newRecord.save();
      return newRecord;
    });
  }
});

export default TrackingRepository;