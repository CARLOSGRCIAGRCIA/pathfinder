import mongoose from "mongoose";
import environment from "./environment.js";

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(environment.MONGODB_URI);
  } catch (error) {
    process.exit(1);
    throw error;
  }
};