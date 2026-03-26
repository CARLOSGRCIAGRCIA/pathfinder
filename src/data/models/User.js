import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
};

export const PERMISSIONS = {
  MAPS: {
    READ: 'maps:read',
    CREATE: 'maps:create',
    UPDATE: 'maps:update',
    DELETE: 'maps:delete',
  },
  WAYPOINTS: {
    READ: 'waypoints:read',
    CREATE: 'waypoints:create',
    UPDATE: 'waypoints:update',
    DELETE: 'waypoints:delete',
  },
  OBSTACLES: {
    READ: 'obstacles:read',
    CREATE: 'obstacles:create',
    UPDATE: 'obstacles:update',
    DELETE: 'obstacles:delete',
  },
  ROUTES: {
    READ: 'routes:read',
    CREATE: 'routes:create',
    UPDATE: 'routes:update',
    DELETE: 'routes:delete',
  },
  USERS: {
    READ: 'users:read',
    CREATE: 'users:create',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
  },
  STATS: {
    READ: 'stats:read',
  },
  API_KEYS: {
    READ: 'api_keys:read',
    CREATE: 'api_keys:create',
    DELETE: 'api_keys:delete',
  },
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.MAPS.READ,
    PERMISSIONS.MAPS.CREATE,
    PERMISSIONS.MAPS.UPDATE,
    PERMISSIONS.MAPS.DELETE,
    PERMISSIONS.WAYPOINTS.READ,
    PERMISSIONS.WAYPOINTS.CREATE,
    PERMISSIONS.WAYPOINTS.UPDATE,
    PERMISSIONS.WAYPOINTS.DELETE,
    PERMISSIONS.OBSTACLES.READ,
    PERMISSIONS.OBSTACLES.CREATE,
    PERMISSIONS.OBSTACLES.UPDATE,
    PERMISSIONS.OBSTACLES.DELETE,
    PERMISSIONS.ROUTES.READ,
    PERMISSIONS.ROUTES.CREATE,
    PERMISSIONS.ROUTES.UPDATE,
    PERMISSIONS.ROUTES.DELETE,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.USERS.CREATE,
    PERMISSIONS.USERS.UPDATE,
    PERMISSIONS.USERS.DELETE,
    PERMISSIONS.STATS.READ,
    PERMISSIONS.API_KEYS.READ,
    PERMISSIONS.API_KEYS.CREATE,
    PERMISSIONS.API_KEYS.DELETE,
  ],
  [USER_ROLES.USER]: [
    PERMISSIONS.MAPS.READ,
    PERMISSIONS.MAPS.CREATE,
    PERMISSIONS.MAPS.UPDATE,
    PERMISSIONS.WAYPOINTS.READ,
    PERMISSIONS.WAYPOINTS.CREATE,
    PERMISSIONS.WAYPOINTS.UPDATE,
    PERMISSIONS.OBSTACLES.READ,
    PERMISSIONS.OBSTACLES.CREATE,
    PERMISSIONS.OBSTACLES.UPDATE,
    PERMISSIONS.ROUTES.READ,
    PERMISSIONS.ROUTES.CREATE,
    PERMISSIONS.STATS.READ,
  ],
  [USER_ROLES.GUEST]: [
    PERMISSIONS.MAPS.READ,
    PERMISSIONS.WAYPOINTS.READ,
    PERMISSIONS.OBSTACLES.READ,
    PERMISSIONS.ROUTES.READ,
  ],
};

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        default: 'en',
      },
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    indexes: [{ username: 1 }, { email: 1 }, { role: 1 }, { isActive: 1 }],
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.hasPermission = function (permission) {
  const permissions = ROLE_PERMISSIONS[this.role] || [];
  return permissions.includes(permission);
};

UserSchema.methods.isAdmin = function () {
  return this.role === USER_ROLES.ADMIN;
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', UserSchema);
