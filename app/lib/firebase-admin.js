// Firebase Admin SDK for server-side operations
// Using lazy initialization to avoid module caching issues

let adminAuth = null;
let initialized = false;

// Only initialize if credentials are valid
const hasValidCredentials =
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_CLIENT_EMAIL.includes("@") &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_PRIVATE_KEY.includes("-----BEGIN PRIVATE KEY-----");

function getAdminAuth() {
  if (initialized) {
    return adminAuth;
  }

  if (!hasValidCredentials) {
    console.warn("⚠️ Firebase Admin credentials not found. Running in development mode.");
    initialized = true;
    return null;
  }

  try {
    // Dynamic import to avoid issues
    const admin = require("firebase-admin");

    // Check if already initialized
    try {
      adminAuth = admin.auth();
      initialized = true;
      console.log("✅ Firebase Admin SDK active");
      return adminAuth;
    } catch (e) {
      // Initialize
      admin.initializeApp({
        credential: admin.credential.cert({
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY,
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
        }),
      });
      adminAuth = admin.auth();
      initialized = true;
      console.log("✅ Firebase Admin SDK initialized");
      return adminAuth;
    }
  } catch (error) {
    console.error("❌ Firebase Admin SDK error:", error.message);
    initialized = true;
    return null;
  }
}

export function getAuth() {
  return getAdminAuth();
}

// For backward compatibility
export { adminAuth };
