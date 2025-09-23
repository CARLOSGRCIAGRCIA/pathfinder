import mongoose from 'mongoose';
import PointSchema from './Point.js';

const RouteSchema = new mongoose.Schema({
    mapId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Map',
        required: true,
    },
    start: {
        type: PointSchema,
        required: true,
    },
    end: {
        type: PointSchema,
        required: true,
    },
    path: [PointSchema],
    distance: {
        type: Number,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

const Route = mongoose.model('Route', RouteSchema);
export default Route;