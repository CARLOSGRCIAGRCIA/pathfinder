import mongoose from 'mongoose';
import PointSchema from './Point.js';

const RouteSchema = new mongoose.Schema(
  {
    mapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Map',
      required: true,
      index: true,
    },
    start: {
      type: PointSchema,
      required: true,
      index: true,
    },
    end: {
      type: PointSchema,
      required: true,
      index: true,
    },
    path: [PointSchema],
    distance: {
      type: Number,
      required: true,
      index: true,
    },
    cost: {
      type: Number,
      default: null,
    },
    algorithm: {
      type: String,
      enum: ['astar', 'dijkstra', 'held-karp', 'two-opt', 'hybrid'],
      default: 'astar',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isOptimal: {
      type: Boolean,
      default: false,
    },
    computationTime: {
      type: Number,
    },
    cached: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      { mapId: 1, distance: 1 },
      { createdBy: 1, createdAt: -1 },
      { mapId: 1, createdAt: -1 },
    ],
  }
);

RouteSchema.methods.toGeoJSON = function () {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: this.path.map(p => [p.x, p.y]),
    },
    properties: {
      distance: this.distance,
      cost: this.cost,
      algorithm: this.algorithm,
      createdAt: this.createdAt,
    },
  };
};

const Route = mongoose.model('Route', RouteSchema);
export default Route;
