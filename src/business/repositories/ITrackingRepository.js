import { Either } from '../utils/either/Either.js';

const ITrackingRepository = {
  getRequestStats: async (userId) => Either.left(new Error('Not implemented')),
  getResponseTimes: async (userId) => Either.left(new Error('Not implemented')),
  getStatusCodes: async (userId) => Either.left(new Error('Not implemented')),
  getPopularEndpoints: async (userId) => Either.left(new Error('Not implemented')),
  addTrackingRecord: async (trackingData) => Either.left(new Error('Not implemented')),
};

export default ITrackingRepository;