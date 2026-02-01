import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.role === "admin";

    if (isAdmin) {
      return NextResponse.json({
        plan: "ADMIN",
        aiRequestsRemaining: Infinity,
        jobSearchesRemaining: Infinity,
        isUnlimited: true,
        isAdmin: true,
        subscription: {
          plan: "PRO",
          status: "ACTIVE",
        },
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.id },
    });

    if (!subscription) {
      // Create default subscription
      await prisma.subscription.create({
        data: {
          userId: session.id,
          plan: "FREE",
          status: "ACTIVE",
        },
      });

      return NextResponse.json({
        plan: "FREE",
        aiRequestsRemaining: 10,
        jobSearchesRemaining: 1,
        isUnlimited: false,
      });
    }

    // Get limits based on plan
    const planLimits: Record<string, { ai: number; searches: number }> = {
      FREE: { ai: 10, searches: 1 },
      STUDENT: { ai: 100, searches: 10 },
      PRO: { ai: Infinity, searches: Infinity },
    };

    const limits = planLimits[subscription.plan] || planLimits.FREE;

    return NextResponse.json({
      plan: subscription.plan,
      aiRequestsRemaining: limits.ai === Infinity ? "Illimité" : limits.ai,
      jobSearchesRemaining: limits.searches,
      isUnlimited: limits.ai === Infinity,
      isAdmin: false,
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
      },
    });
  } catch (error) {
    console.error("Usage fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
