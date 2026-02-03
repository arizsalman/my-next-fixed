import { NextResponse } from "next/server";
import connectDB from "@/app/lib_mongo/db";
import Comment from "@/models/Comment";
import { verifyAdmin } from "@/app/lib/admin";

// DELETE comment
export async function DELETE(request, { params }) {
  try {
    const authResult = await verifyAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const { id } = await params;

    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
