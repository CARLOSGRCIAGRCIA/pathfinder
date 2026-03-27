import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Environment from '../../data/config/environment.js';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (token) {
        try {
          const decoded = jwt.verify(token, Environment.JWT_SECRET);
          socket.user = decoded;
        } catch (err) {
          console.log('Socket auth error:', err.message);
        }
      }
      next();
    });

    this.io.on('connection', socket => {
      console.log(`Client connected: ${socket.id}`);

      if (socket.user && socket.user._id) {
        this.connectedUsers.set(socket.user._id, socket.id);
        socket.join(`user:${socket.user._id}`);
      }

      socket.on('join-map', mapId => {
        if (mapId) {
          socket.join(`map:${mapId}`);
          console.log(`Socket ${socket.id} joined map:${mapId}`);
        }
      });

      socket.on('leave-map', mapId => {
        if (mapId) {
          socket.leave(`map:${mapId}`);
        }
      });

      socket.on('disconnect', reason => {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
        if (socket.user && socket.user._id) {
          this.connectedUsers.delete(socket.user._id);
        }
      });
    });

    console.log('Socket.IO initialized');
    return this.io;
  }

  emit(event, data, room = null) {
    if (!this.io) return;

    if (room) {
      this.io.to(room).emit(event, data);
    } else {
      this.io.emit(event, data);
    }
  }

  emitToUser(userId, event, data) {
    if (!this.io || !userId) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  emitToMap(mapId, event, data) {
    if (!this.io || !mapId) return;
    this.io.to(`map:${mapId}`).emit(event, data);
  }

  emitMapCreated(map) {
    this.emit('map:created', { success: true, data: map });
  }

  emitMapUpdated(map) {
    this.emit('map:updated', { success: true, data: map });
    this.emitToMap(map._id, 'map:updated', { success: true, data: map });
  }

  emitMapDeleted(mapId) {
    this.emit('map:deleted', { success: true, data: { _id: mapId } });
    this.emitToMap(mapId, 'map:deleted', { success: true, data: { _id: mapId } });
  }

  emitWaypointCreated(mapId, waypoint) {
    this.emit('waypoint:created', { success: true, data: waypoint });
    this.emitToMap(mapId, 'waypoint:created', { success: true, data: waypoint });
  }

  emitWaypointUpdated(mapId, waypoint) {
    this.emit('waypoint:updated', { success: true, data: waypoint });
    this.emitToMap(mapId, 'waypoint:updated', { success: true, data: waypoint });
  }

  emitWaypointDeleted(mapId, waypointId) {
    this.emit('waypoint:deleted', { success: true, data: { _id: waypointId } });
    this.emitToMap(mapId, 'waypoint:deleted', { success: true, data: { _id: waypointId } });
  }

  emitObstacleCreated(mapId, obstacle) {
    this.emit('obstacle:created', { success: true, data: obstacle });
    this.emitToMap(mapId, 'obstacle:created', { success: true, data: obstacle });
  }

  emitObstacleUpdated(mapId, obstacle) {
    this.emit('obstacle:updated', { success: true, data: obstacle });
    this.emitToMap(mapId, 'obstacle:updated', { success: true, data: obstacle });
  }

  emitObstacleDeleted(mapId, obstacleId) {
    this.emit('obstacle:deleted', { success: true, data: { _id: obstacleId } });
    this.emitToMap(mapId, 'obstacle:deleted', { success: true, data: { _id: obstacleId } });
  }

  emitRouteCreated(mapId, route) {
    this.emit('route:created', { success: true, data: route });
    this.emitToMap(mapId, 'route:created', { success: true, data: route });
  }

  emitRouteDeleted(mapId, routeId) {
    this.emit('route:deleted', { success: true, data: { _id: routeId } });
    this.emitToMap(mapId, 'route:deleted', { success: true, data: { _id: routeId } });
  }
}

const socketService = new SocketService();
export default socketService;
