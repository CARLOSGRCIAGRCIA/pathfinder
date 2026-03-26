import mongoose from 'mongoose';
import crypto from 'crypto';

const ApiKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    permissions: [
      {
        type: String,
      },
    ],
    usageCount: {
      type: Number,
      default: 0,
    },
    rateLimit: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
    indexes: [{ user: 1 }, { isActive: 1 }, { expiresAt: 1 }],
  }
);

ApiKeySchema.pre('save', function (next) {
  if (this.isNew && !this.key) {
    this.key = `pf_${crypto.randomBytes(32).toString('hex')}`;
  }
  next();
});

ApiKeySchema.methods.incrementUsage = async function () {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

ApiKeySchema.methods.isExpired = function () {
  return this.expiresAt && this.expiresAt < new Date();
};

ApiKeySchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.key = this.key.substring(0, 12) + '...';
  return obj;
};

export default mongoose.model('ApiKey', ApiKeySchema);
