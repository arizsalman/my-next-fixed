import { NextResponse } from "next/server";
import connectDB from "@/app/lib_mongo/db";
import User from "@/models/User";
import { getAuth } from "@/app/lib/firebase-admin";

// POST → Create or update user from Firebase token
export async function POST(request) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    const adminAuth = getAuth();

    let decodedToken;
    if (adminAuth) {
      try {
        decodedToken = await adminAuth.verifyIdToken(token);
      } catch (e) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: "Admin auth not configured" }, { status: 500 });
    }

    const { uid, email, name, picture } = decodedToken;

    // Find or create user
    let user = await User.findOne({ uid });

    if (user) {
      // Update existing user
      user.email = email;
      user.name = name;
      user.photoURL = picture;
      await user.save();
    } else {
      // Create new user
      user = new User({
        uid,
        email,
        name,
        photoURL: picture,
        role: "user",
      });
      await user.save();
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET → Get current user from database
export async function GET(request) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];

    const adminAuth = getAuth();

    let decodedToken;
    if (adminAuth) {
      try {
        decodedToken = await adminAuth.verifyIdToken(token);
      } catch (e) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: "Admin auth not configured" }, { status: 500 });
    }

    const user = await User.findOne({ uid: decodedToken.uid });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
