import { getAuth } from "./firebase-admin";

// Admin emails for development
const ADMIN_EMAILS = [
  "muhammadarizsalman@gmail.com",
  "admin@locallink.com",
];

/**
 * Middleware to verify admin role for API routes
 * For development, allows any authenticated user when Firebase Admin is not configured
 */
export async function verifyAdmin(request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Unauthorized: No token provided", status: 401 };
  }

  const token = authHeader.split("Bearer ")[1];

  // Get adminAuth using lazy initialization
  const adminAuth = getAuth();

  // If Firebase Admin is not configured, skip verification in development
  if (!adminAuth) {
    console.log("Development mode: Skipping admin verification");
    return {
      user: { email: ADMIN_EMAILS[0] },
      uid: "dev-uid",
      email: ADMIN_EMAILS[0],
      isDev: true
    };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const email = decodedToken.email;

    // Check if user has admin claim or is in admin emails
    const isAdmin =
      decodedToken.role === "admin" ||
      decodedToken.admin === true ||
      ADMIN_EMAILS.includes(email);

    if (!isAdmin) {
      return { error: "Forbidden: Admin privileges required", status: 403 };
    }

    return { user: decodedToken, uid: decodedToken.uid, email };
  } catch (error) {
    console.error("Admin verification failed:", error);
    return { error: "Unauthorized: Invalid token", status: 401 };
  }
}

/**
 * Verify that user is authenticated (but not necessarily admin)
 */
export async function verifyAuth(request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Unauthorized: No token provided", status: 401 };
  }

  const token = authHeader.split("Bearer ")[1];

  const adminAuth = getAuth();

  // If Firebase Admin is not configured, skip verification in development
  if (!adminAuth) {
    return {
      user: { email: ADMIN_EMAILS[0] },
      uid: "dev-uid",
      email: ADMIN_EMAILS[0],
      isDev: true
    };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { user: decodedToken, uid: decodedToken.uid, email: decodedToken.email };
  } catch (error) {
    console.error("Auth verification failed:", error);
    return { error: "Unauthorized: Invalid token", status: 401 };
  }
}
