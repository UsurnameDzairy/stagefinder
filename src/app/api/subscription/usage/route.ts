import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PlanType, getRemainingAIRequests, getRemainingJobSearches } from "@/lib/subscription-limits";

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

    const plan = subscription.plan as PlanType;
    const aiRemaining = getRemainingAIRequests(
      plan,
      subscription.aiRequestsUsed,
      subscription.aiRequestsTotal,
      subscription.lastResetAt
    );
    const jobSearchesRemaining = getRemainingJobSearches(
      plan,
      subscription.jobSearchesUsed,
      subscription.lastResetAt
    );

    return NextResponse.json({
      plan,
      aiRequestsRemaining: aiRemaining === Infinity ? "Illimité" : aiRemaining,
      jobSearchesRemaining,
      isUnlimited: aiRemaining === Infinity,
    });
  } catch (error) {
    console.error("Usage fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
