import { NextResponse } from "next/server";
import connectDB from "@/app/lib_mongo/db";
import Issue from "@/models/Issue";
import { verifyAdmin } from "@/app/lib/admin";

// GET all issues (paginated, filterable)
export async function GET(request) {
  try {
    const authResult = await verifyAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";

    const query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate("author", "name email")
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Issue.countDocuments(query),
    ]);

    // Get analytics data
    const [statusCounts, categoryCounts, totalIssues] = await Promise.all([
      Issue.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Issue.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]),
      Issue.countDocuments(),
    ]);

    return NextResponse.json({
      issues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      analytics: {
        totalIssues,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        categoryCounts: categoryCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 });
  }
}
