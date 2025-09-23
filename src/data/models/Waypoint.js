import mongoose from 'mongoose';

const WaypointSchema = new mongoose.Schema({
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    map: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Map',
        required: true
    }
});

WaypointSchema.index({ map: 1, x: 1, y: 1 });

export default mongoose.model('Waypoint', WaypointSchema);