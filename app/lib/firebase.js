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

let app;
let auth;

try {
  // Only initialize if we have a real API key (not the demo one)
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.startsWith("demo")) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  }
} catch (error) {
  console.warn("Firebase initialization skipped during build");
}

export { app, auth };
export default app;
