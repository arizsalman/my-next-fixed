
// C:\Users\FairCom\Desktop\Project\my-next-fixed\app\api\comments\route.js
import { NextResponse } from "next/server";

import connectDB from "@/app/lib_mongo/db";

import Comment from "@/models/Comment";

// ✅ POST: Add a comment
export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const comment = await Comment.create(body);
  return NextResponse.json(comment);
}

// ✅ GET: Get comments by issueId
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const issueId = searchParams.get("issueId");
  const comments = await Comment.find({ issueId }).sort({ createdAt: -1 });
  return NextResponse.json(comments);
}
