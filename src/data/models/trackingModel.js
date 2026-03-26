import mongoose from 'mongoose';

const trackingSchema = new mongoose.Schema({
  endpointAccess: { type: String, required: true },
  requestMethod: { type: String, required: true },
  statusCode: { type: Number, required: true },
  responseTime: {
    avg: { type: Number, required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  requestCount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model('Tracking', trackingSchema);
