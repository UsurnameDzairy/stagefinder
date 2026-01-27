import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllUsageStats, canPerformAction, UsageType } from "@/lib/usage-limits";

// GET /api/usage - Get current usage stats
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getAllUsageStats(session.id);

    return NextResponse.json({
      success: true,
      ...stats,
    });
  } catch (error) {
    console.error("Usage fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage stats" },
      { status: 500 }
    );
  }
}

// POST /api/usage/check - Check if action is allowed
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type } = body as { type: UsageType };

    if (!type || !["application", "search"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid usage type" },
        { status: 400 }
      );
    }

    const result = await canPerformAction(session.id, type);

    return NextResponse.json({
      success: true,
      allowed: result.allowed,
      reason: result.reason,
      usage: result.usage,
    });
  } catch (error) {
    console.error("Usage check error:", error);
    return NextResponse.json(
      { error: "Failed to check usage" },
      { status: 500 }
    );
  }
}
