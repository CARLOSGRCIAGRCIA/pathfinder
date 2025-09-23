import mongoose from 'mongoose';

const PointSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
});

export default PointSchema;