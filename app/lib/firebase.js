// Firebase client SDK initialization
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Use environment variables or fallback for build
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

let app = null;
let auth = null;

// Only initialize Firebase if we have real environment variables
const hasRealConfig =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo-api-key" &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

if (typeof window !== "undefined" && hasRealConfig) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (error) {
    console.warn("Firebase initialization failed:", error.message);
  }
}

// Create a mock auth object for development when Firebase isn't configured
if (!auth && typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.log("Firebase not configured - running in development mode");
}

export { app, auth };
export default app;
