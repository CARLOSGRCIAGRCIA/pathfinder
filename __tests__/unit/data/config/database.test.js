import mongoose from 'mongoose';
import {
  connectToDatabase,
  disconnectFromDatabase,
  getConnectionState,
} from '../../../../src/data/config/database.js';
import environment from '../../../../src/data/config/environment.js';

jest.mock('mongoose');

describe('Database Configuration', () => {
  describe('connectToDatabase', () => {
    let exitMock;

    beforeEach(() => {
      jest.clearAllMocks();
      exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});
    });

    afterEach(() => {
      exitMock.mockRestore();
    });

    it('should connect to MongoDB successfully', async () => {
      mongoose.connect.mockResolvedValueOnce();
      mongoose.connection = {
        on: jest.fn(),
      };

      await connectToDatabase();

      expect(mongoose.connect).toHaveBeenCalledWith(environment.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
    });

    it('should handle connection error', async () => {
      const mockError = new Error('Connection failed');

      mongoose.connect.mockRejectedValueOnce(mockError);

      await expect(connectToDatabase()).rejects.toThrow('Connection failed');
    });
  });

  describe('disconnectFromDatabase', () => {
    it('should disconnect from MongoDB', async () => {
      mongoose.disconnect.mockResolvedValueOnce();

      await disconnectFromDatabase();

      expect(mongoose.disconnect).toHaveBeenCalled();
    });

    it('should handle disconnect error', async () => {
      const mockError = new Error('Disconnect failed');
      mongoose.disconnect.mockRejectedValueOnce(mockError);

      await expect(disconnectFromDatabase()).rejects.toThrow('Disconnect failed');
    });
  });

  describe('getConnectionState', () => {
    it('should return connection state', () => {
      mongoose.connection = {
        readyState: 1,
        host: 'localhost',
        name: 'test',
      };

      const state = getConnectionState();

      expect(state.isConnected).toBe(true);
      expect(state.state).toBe(1);
      expect(state.host).toBe('localhost');
      expect(state.name).toBe('test');
    });

    it('should return disconnected state when not connected', () => {
      mongoose.connection = {
        readyState: 0,
      };

      const state = getConnectionState();

      expect(state.isConnected).toBe(false);
      expect(state.state).toBe(0);
    });
  });
});
