import mongoose from "mongoose";

let isConnected = false;

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn("MONGODB_URI is not set. Running with in-memory fallback data.");
    return false;
  }

  if (isConnected) {
    return true;
  }

  await mongoose.connect(mongoUri);
  isConnected = true;
  return true;
}

export function isDatabaseReady() {
  return isConnected && mongoose.connection.readyState === 1;
}
