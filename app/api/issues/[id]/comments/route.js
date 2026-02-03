// app/api/issues/[id]/comments/route.js
import { NextResponse } from "next/server";
import connectDB from "@/app/lib_mongo/db";
import Comment from "@/models/Comment";
import Issue from "@/models/Issue";
import { auth } from "@/app/lib_mongo/auth";

// GET → Fetch comments for an issue
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Verify the issue exists
    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Fetch comments for this issue
    const comments = await Comment.find({ issueId: id }).sort({ createdAt: -1 });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("GET Comments Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST → Add a comment to an issue
export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Verify auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { text, username } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    // Verify the issue exists
    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Create the comment
    const comment = new Comment({
      issueId: id,
      username: username || decodedToken.name || decodedToken.email || "Anonymous",
      text: text.trim(),
    });

    await comment.save();

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("POST Comment Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
