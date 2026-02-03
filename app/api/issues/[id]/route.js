// app/api/issues/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/app/lib_mongo/db";
import Issue from "@/models/Issue";
import Comment from "@/models/Comment";
import { auth } from "@/app/lib_mongo/auth";

// GET → Fetch single issue with comments
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Fetch comments for this issue
    const comments = await Comment.find({ issueId: id }).sort({ createdAt: -1 });

    return NextResponse.json({ issue, comments });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH → Update issue details (author or admin only)
export async function PATCH(req, { params }) {
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
    const { title, description, category, latitude, longitude, status } = body;

    // Find issue and check ownership
    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Allow update if user is author or has admin role (you can add admin check)
    if (issue.author.uid !== decodedToken.uid) {
      return NextResponse.json({ error: "Forbidden: Not the issue owner" }, { status: 403 });
    }

    // Update fields
    if (title) issue.title = title;
    if (description) issue.description = description;
    if (category) issue.category = category;
    if (latitude) issue.latitude = latitude;
    if (longitude) issue.longitude = longitude;
    if (status) issue.status = status;

    await issue.save();
    return NextResponse.json(issue);
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE → Delete issue (author or admin only)
export async function DELETE(req, { params }) {
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

    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Allow delete if user is author or has admin role
    if (issue.author.uid !== decodedToken.uid) {
      return NextResponse.json({ error: "Forbidden: Not the issue owner" }, { status: 403 });
    }

    // Delete associated comments first
    await Comment.deleteMany({ issueId: id });

    // Delete the issue
    await Issue.findByIdAndDelete(id);

    return NextResponse.json({ message: "Issue deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
