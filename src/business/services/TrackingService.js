import TrackingRepository from "../../data/repositories/trackingRepository.js";
import { Either } from "../utils/either/Either.js";

const TrackingService = {
  getRequestStats: async userId => {
    return await TrackingRepository.getRequestStats(userId);
  },

  getResponseTimes: async userId => {
    return await TrackingRepository.getResponseTimes(userId);
  },

  getStatusCodes: async userId => {
    return await TrackingRepository.getStatusCodes(userId);
  },

  getPopularEndpoints: async userId => {
    return await TrackingRepository.getPopularEndpoints(userId);
  },

  addTrackingRecord: async trackingData => {
    return await TrackingRepository.addTrackingRecord(trackingData);
  }
};

export default TrackingService;
