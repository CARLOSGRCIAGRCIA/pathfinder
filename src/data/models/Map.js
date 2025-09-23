import mongoose from 'mongoose';
import PointSchema from './Point.js';

const MapSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    },
  },
  {
    timestamps: true,
  }
);

MapSchema.methods.calculateArea = function () {
  return this.width * this.height;
};

export default mongoose.model('Map', MapSchema);
