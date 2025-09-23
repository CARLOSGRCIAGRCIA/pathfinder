import mongoose from 'mongoose';

const ObstacleSchema = new mongoose.Schema({
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    size: { type: Number, default: 1, min: 1, max: 3 },
    map: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Map',
        required: true,
    },
});

ObstacleSchema.index({ x: 1, y: 1 });

export default mongoose.model('Obstacle', ObstacleSchema);