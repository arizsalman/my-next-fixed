// app/api/issues/[id]/upvote/route.js
import { NextResponse } from "next/server";
import connectDB from "@/app/lib_mongo/db";
import Issue from "@/models/Issue";
import { getAuth } from "@/app/lib/firebase-admin";

// POST → Toggle upvote
export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Get user ID from authorization token
    const authHeader = req.headers.get("authorization");
    let userId;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      try {
        const adminAuth = getAuth();
        if (adminAuth) {
          const decodedToken = await adminAuth.verifyIdToken(token);
          userId = decodedToken.uid;
        }
      } catch (e) {
        console.error("Token verification failed:", e);
      }
    }

    // Fallback: get user ID from request body or header
    if (!userId) {
      const body = await req.json().catch(() => ({}));
      userId = body.userId || req.headers.get("x-user-id");
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Initialize upvoters array if it doesn't exist
    if (!issue.upvoters) {
      issue.upvoters = [];
    }

    // Check if user already upvoted
    const hasUpvoted = issue.upvoters.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      issue.upvoters = issue.upvoters.filter(uid => uid !== userId);
      issue.upvotes = Math.max(0, issue.upvotes - 1);
    } else {
      // Add upvote
      issue.upvoters.push(userId);
      issue.upvotes += 1;
    }

    await issue.save();

    return NextResponse.json({
      upvotes: issue.upvotes,
      hasUpvoted: !hasUpvoted
    });
  } catch (error) {
    console.error("UPVOTE Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
