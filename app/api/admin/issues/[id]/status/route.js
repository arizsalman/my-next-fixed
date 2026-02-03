// app/api/admin/issues/[id]/status/route.js
import { NextResponse } from "next/server";
import connectDB from "@/app/lib_mongo/db";
import Issue from "@/models/Issue";
import { verifyAdmin } from "@/app/lib/admin";

// Status transition order: Pending → In Progress → Resolved
const STATUS_TRANSITION = {
  "Pending": "In Progress",
  "In Progress": "Resolved",
  "Resolved": "Resolved", // Stay at resolved
};

// PATCH → Change issue status (admin-only)
export async function PATCH(req, { params }) {
  try {
    const authResult = await verifyAdmin(req);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const { id } = await params;

    const body = await req.json();
    const { action } = body;

    // Find the issue
    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Handle status transitions
    if (action === "next") {
      // Move to next status in the workflow
      const currentStatus = issue.status;
      const nextStatus = STATUS_TRANSITION[currentStatus];

      if (nextStatus && nextStatus !== currentStatus) {
        issue.status = nextStatus;
        await issue.save();
        return NextResponse.json({
          message: `Status updated to ${nextStatus}`,
          issue
        });
      } else {
        return NextResponse.json({
          error: "Issue is already resolved or no further transitions available"
        }, { status: 400 });
      }
    } else if (action === "set") {
      // Set specific status (for admin manual override)
      const { status } = body;
      const validStatuses = ["Pending", "In Progress", "Resolved"];

      if (!validStatuses.includes(status)) {
        return NextResponse.json({
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        }, { status: 400 });
      }

      issue.status = status;
      await issue.save();
      return NextResponse.json({
        message: `Status updated to ${status}`,
        issue
      });
    } else {
      return NextResponse.json({
        error: "Invalid action. Use 'next' for automatic transition or 'set' for manual override"
      }, { status: 400 });
    }
  } catch (error) {
    console.error("PATCH Status Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
