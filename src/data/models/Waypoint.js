import mongoose from 'mongoose';

const WaypointSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
      index: 'text',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    map: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Map',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'checkpoint',
        'fuel',
        'food',
        'rest',
        'danger',
        'landmark',
        'custom',
        'start',
        'end',
        'normal',
      ],
      default: 'normal',
    },
    order: {
      type: Number,
      default: 0,
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    metadata: {
      icon: String,
      color: String,
      label: String,
    },
  },
  {
    timestamps: true,
    indexes: [
      { map: 1, x: 1, y: 1 },
      { map: 1, order: 1 },
      { map: 1, type: 1 },
      { name: 'text', description: 'text' },
    ],
  }
);

WaypointSchema.index({ location: '2dsphere' });

WaypointSchema.virtual('location').get(function () {
  return {
    type: 'Point',
    coordinates: [this.x, this.y],
  };
});

WaypointSchema.set('toJSON', { virtuals: true });
WaypointSchema.set('toObject', { virtuals: true });

WaypointSchema.methods.toGeoJSON = function () {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [this.x, this.y],
    },
    properties: {
      name: this.name,
      description: this.description,
      type: this.type,
      order: this.order,
    },
  };
};

export default mongoose.model('Waypoint', WaypointSchema);
