import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  // Skip connection during build time
  if (process.env.NEXT_PHASE === "build") {
    console.log("Skipping DB connection during build");
    return null;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  
  console.log("MONGODB_URI present:", !!MONGODB_URI);
  console.log("MONGODB_URI value:", MONGODB_URI ? MONGODB_URI.substring(0, 30) + "..." : "undefined");

  if (!MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI not set - some features may not work");
    return null;
  }

  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Creating new MongoDB connection...");
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "issuesdb",
    }).then((conn) => {
      console.log("✅ MongoDB connected successfully");
      return conn;
    }).catch((err) => {
      console.error("❌ MongoDB connection failed:", err.message);
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
