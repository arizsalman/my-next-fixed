// app/api/issues/route.js
import { NextResponse } from "next/server";
import connectDB from "@/app/lib_mongo/db";
import Issue from "@/models/Issue";
import Comment from "@/models/Comment";
import { auth } from "@/app/lib_mongo/auth";

// GET → Fetch all issues
export async function GET(req) {
  try {
    await connectDB();
    const issues = await Issue.find().sort({ createdAt: -1 });
    return NextResponse.json(issues);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST → Create a new issue (requires auth)
export async function POST(req) {
  try {
    await connectDB();

    // Verify Firebase auth token
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;

    try {
      decodedToken = await auth.verifyIdToken(token);
      console.log("Decoded token:", decodedToken);
    } catch (authError) {
      console.error("Auth verification failed:", authError);
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
    }

    // Check if token has valid user info
    if (!decodedToken.uid) {
      console.error("Token missing uid:", decodedToken);
      return NextResponse.json({ error: "Invalid token: missing user ID" }, { status: 401 });
    }

    const body = await req.json();

    // Create the issue
    const issue = await Issue.create({
      ...body,
      author: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email,
      },
    });

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
