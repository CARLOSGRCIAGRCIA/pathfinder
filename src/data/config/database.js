import mongoose from 'mongoose';
import environment from './environment.js';

let isConnected = false;
let connectionState = 'disconnected';

export const getConnectionState = () => ({
  isConnected: mongoose.connection.readyState === 1,
  state: mongoose.connection.readyState,
  host: mongoose.connection.host,
  name: mongoose.connection.name,
});

export const connectToDatabase = async () => {
  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(environment.MONGODB_URI, options);
    isConnected = true;
    connectionState = 'connected';

    mongoose.connection.on('error', err => {
      isConnected = false;
      connectionState = 'error';
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      connectionState = 'disconnected';
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      connectionState = 'connected';
      console.log('MongoDB reconnected');
    });

    console.log('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    isConnected = false;
    connectionState = 'error';
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

export const disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect();
    isConnected = false;
    connectionState = 'disconnected';
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

export default { connectToDatabase, disconnectFromDatabase, getConnectionState };
