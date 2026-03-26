import mongoose from 'mongoose';

const RouteCacheSchema = new mongoose.Schema(
  {
    cacheKey: {
      type: String,
      required: true,
      unique: true,
    },
    startPoint: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    endPoint: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    waypoints: [
      {
        x: Number,
        y: Number,
        name: String,
      },
    ],
    obstacles: [
      {
        x: Number,
        y: Number,
        size: Number,
      },
    ],
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    terrainGridHash: {
      type: String,
    },
    result: {
      path: Array,
      distance: Number,
      cost: Number,
    },
    expiresAt: {
      type: Date,
    },
    hits: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    indexes: [{ cacheKey: 1 }, { expiresAt: 1 }, { hits: -1 }],
  }
);

RouteCacheSchema.methods.incrementHits = async function () {
  this.hits += 1;
  return this.save();
};

RouteCacheSchema.statics.generateKey = function (params) {
  const { start, end, waypoints = [], obstacles = [], width, height, terrainGrid = null } = params;

  const waypointsKey = waypoints
    .map(w => `${Math.round(w.x)},${Math.round(w.y)}`)
    .sort()
    .join('|');

  const obstaclesKey = obstacles
    .map(o => `${Math.round(o.x)},${Math.round(o.y)},${Math.round(o.size)}`)
    .sort()
    .join('|');

  let terrainHash = 'default';
  if (terrainGrid && Array.isArray(terrainGrid)) {
    terrainHash = terrainGrid.map(row => row.slice(0, 10).join(',')).join(';');
    if (terrainHash.length > 50) {
      terrainHash = terrainHash.substring(0, 50) + '_hash';
    }
  }

  const keyParts = [
    `${Math.round(start.x)},${Math.round(start.y)}`,
    `${Math.round(end.x)},${Math.round(end.y)}`,
    waypointsKey,
    obstaclesKey,
    `${width}x${height}`,
    terrainHash,
  ];

  return keyParts.join('::');
};

export default mongoose.model('RouteCache', RouteCacheSchema);
