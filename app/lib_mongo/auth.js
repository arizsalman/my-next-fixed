// Server-side Firebase Admin SDK for auth token verification
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Check if required environment variables are present
const hasFirebaseAdminConfig = Boolean(
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);

// Initialize Firebase Admin only if config is available
let adminAuth = null;
let adminApp = null;

if (hasFirebaseAdminConfig) {
  try {
    const firebaseAdminConfig = {
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    };

    if (!getApps().length) {
      adminApp = initializeApp(firebaseAdminConfig, "admin");
    } else {
      adminApp = getApps()[0];
    }

    adminAuth = getAuth(adminApp);
    console.log("✅ Firebase Admin Auth initialized");
  } catch (error) {
    console.warn("Firebase Admin Auth initialization failed:", error.message);
    adminAuth = null;
  }
} else {
  console.warn("Firebase Admin config not found. Running in development mode.");
  console.warn("Add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to environment variables for production.");
}

// Mock auth for development (only used when Firebase Admin is not configured)
const mockAuth = {
  verifyIdToken: async (token) => {
    console.log("Development mode: Token verification skipped");
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
      
      // Ensure uid is present (Firebase tokens have 'sub' for user ID)
      if (!payload.uid && payload.sub) {
        payload.uid = payload.sub;
      }
      
      return payload;
    } catch {
      // Return a mock payload for testing
      return {
        uid: 'dev-user-123',
        email: 'dev@example.com',
        name: 'Development User',
      };
    }
  }
};

// Export either real auth or mock based on configuration
const auth = adminAuth || mockAuth;
export { auth };
