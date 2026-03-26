import mongoose from 'mongoose';
import PointSchema from './Point.js';

const MapSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    width: {
      type: Number,
      required: true,
      min: 50,
      max: 500,
      validate: {
        validator: Number.isInteger,
        message: 'Width must be an integer',
      },
    },
    height: {
      type: Number,
      required: true,
      min: 50,
      max: 500,
      validate: {
        validator: Number.isInteger,
        message: 'Height must be an integer',
      },
    },
    start: {
      type: PointSchema,
      required: true,
    },
    end: {
      type: PointSchema,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    terrainGrid: {
      type: String,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'medium',
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      estimatedDistance: Number,
      optimalCost: Number,
      waypointCount: Number,
      obstacleCount: Number,
    },
  },
  {
    timestamps: true,
    indexes: [
      { name: 1, description: 'text' },
      { creator: 1, isPublic: 1 },
      { isPublic: 1, createdAt: -1 },
      { tags: 1 },
      { isFavorite: -1, viewCount: -1 },
    ],
  }
);

MapSchema.index({ name: 'text', description: 'text' }, { weights: { name: 10, description: 1 } });

MapSchema.methods.calculateArea = function () {
  return this.width * this.height;
};

MapSchema.methods.incrementViewCount = async function () {
  this.viewCount += 1;
  return this.save();
};

MapSchema.methods.toGeoJSON = function () {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [this.width, 0],
          [this.width, this.height],
          [0, this.height],
          [0, 0],
        ],
      ],
    },
    properties: {
      name: this.name,
      description: this.description,
      start: this.start,
      end: this.end,
    },
  };
};

export default mongoose.model('Map', MapSchema);
