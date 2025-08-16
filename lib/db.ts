// lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in environment");
}

// We cache the connection across hot reloads in dev to prevent creating new connections
declare global {
  // eslint-disable-next-line no-var
  var __mongoose_conn: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

let cached = global.__mongoose_conn;
if (!cached) {
  cached = global.__mongoose_conn = { conn: null, promise: null };
}

export default async function dbConnect(): Promise<typeof mongoose> {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI!, {
      // You can add options here if needed
    });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn!;
}