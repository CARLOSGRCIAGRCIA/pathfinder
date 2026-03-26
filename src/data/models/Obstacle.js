import mongoose from 'mongoose';

const ObstacleSchema = new mongoose.Schema(
  {
    x: {
      type: Number,
      required: true,
      index: true,
    },
    y: {
      type: Number,
      required: true,
      index: true,
    },
    size: {
      type: Number,
      default: 1,
      min: 1,
      max: 3,
      index: true,
    },
    map: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Map',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['wall', 'rock', 'water', 'building', 'forest', 'pit', 'custom'],
      default: 'wall',
    },
    rotation: {
      type: Number,
      default: 0,
      min: 0,
      max: 360,
    },
    isPassable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      { map: 1, x: 1, y: 1 },
      { map: 1, type: 1 },
      { map: 1, size: 1 },
    ],
  }
);

ObstacleSchema.methods.toGeoJSON = function () {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [this.x - this.size / 2, this.y - this.size / 2],
          [this.x + this.size / 2, this.y - this.size / 2],
          [this.x + this.size / 2, this.y + this.size / 2],
          [this.x - this.size / 2, this.y + this.size / 2],
          [this.x - this.size / 2, this.y - this.size / 2],
        ],
      ],
    },
    properties: {
      size: this.size,
      type: this.type,
    },
  };
};

export default mongoose.model('Obstacle', ObstacleSchema);
