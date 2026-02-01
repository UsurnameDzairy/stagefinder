import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PlanType } from "./subscription-limits";

export interface SubscriptionCheck {
  allowed: boolean;
  plan: PlanType;
  remaining?: number;
  message?: string;
}

// Plan limits
const PLAN_LIMITS = {
  FREE: { ai: 10, searches: 1 },
  STUDENT: { ai: 100, searches: 10 },
  PRO: { ai: Infinity, searches: Infinity },
};

/**
 * Get or create usage tracking for a user
 */
async function getOrCreateUsage(userId: string, type: "ai" | "search") {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  let usage = await prisma.usageTracking.findFirst({
    where: {
      userId,
      type,
      periodStart: startOfDay,
    },
  });

  if (!usage) {
    usage = await prisma.usageTracking.create({
      data: {
        userId,
        type,
        periodStart: startOfDay,
        periodEnd: endOfDay,
        count: 0,
      },
    });
  }

  return usage;
}

/**
 * Check if user can make an AI request
 */
export async function checkAIRequestLimit(userId: string): Promise<SubscriptionCheck> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    // Create default FREE subscription if none exists
    await prisma.subscription.create({
      data: {
        userId,
        plan: "FREE",
        status: "ACTIVE",
      },
    });

    return {
      allowed: true,
      plan: "FREE" as PlanType,
      remaining: PLAN_LIMITS.FREE.ai - 1,
    };
  }

  const plan = subscription.plan as PlanType;
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;

  // Pro has unlimited
  if (limits.ai === Infinity) {
    return { allowed: true, plan };
  }

  // Get today's usage
  const usage = await getOrCreateUsage(userId, "ai");

  if (usage.count >= limits.ai) {
    return {
      allowed: false,
      plan,
      message: plan === "FREE"
        ? "You've reached your daily AI limit. Upgrade to Student or Pro for more."
        : "Daily AI limit reached. Come back tomorrow or upgrade to Pro.",
    };
  }

  return {
    allowed: true,
    plan,
    remaining: limits.ai - usage.count - 1,
  };
}

/**
 * Increment AI request usage
 */
export async function incrementAIUsage(userId: string): Promise<void> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  await prisma.usageTracking.upsert({
    where: {
      userId_type_periodStart: {
        userId,
        type: "ai",
        periodStart: startOfDay,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId,
      type: "ai",
      periodStart: startOfDay,
      periodEnd: endOfDay,
      count: 1,
    },
  });
}

/**
 * Check if user can make a job search request
 */
export async function checkJobSearchLimit(userId: string): Promise<SubscriptionCheck> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    await prisma.subscription.create({
      data: {
        userId,
        plan: "FREE",
        status: "ACTIVE",
      },
    });

    return {
      allowed: true,
      plan: "FREE" as PlanType,
      remaining: 0,
    };
  }

  const plan = subscription.plan as PlanType;
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;

  // Pro has unlimited
  if (limits.searches === Infinity) {
    return { allowed: true, plan };
  }

  // Get today's usage
  const usage = await getOrCreateUsage(userId, "search");

  if (usage.count >= limits.searches) {
    return {
      allowed: false,
      plan,
      message: "Daily job search limit reached. Upgrade for more searches.",
    };
  }

  return {
    allowed: true,
    plan,
    remaining: limits.searches - usage.count - 1,
  };
}

/**
 * Increment job search usage
 */
export async function incrementJobSearchUsage(userId: string): Promise<void> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  await prisma.usageTracking.upsert({
    where: {
      userId_type_periodStart: {
        userId,
        type: "search",
        periodStart: startOfDay,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId,
      type: "search",
      periodStart: startOfDay,
      periodEnd: endOfDay,
      count: 1,
    },
  });
}

/**
 * Check if user has access to a feature
 */
export async function checkFeatureAccess(
  userId: string,
  feature: 'hasCVAnalysis' | 'hasCoverLetterGeneration' | 'hasEmailAlerts' | 'hasRealtimeAlerts' | 'hasPrioritySupport' | 'hasUnlimitedOffers'
): Promise<{ allowed: boolean; plan: PlanType; message?: string }> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const plan = (subscription?.plan || "FREE") as PlanType;

  // All features available to all plans for now
  const allowed = true;

  if (!allowed) {
    return {
      allowed: false,
      plan,
      message: "This feature requires a higher subscription.",
    };
  }

  return {
    allowed: true,
    plan,
  };
}

/**
 * Middleware helper for API routes
 */
export async function requireSubscription(req: NextRequest, minPlan?: PlanType) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  }

  if (minPlan) {
    const plan = subscription?.plan || "FREE";
    const planOrder = { FREE: 0, STUDENT: 1, PRO: 2 };

    if (planOrder[plan as PlanType] < planOrder[minPlan]) {
      return NextResponse.json(
        { error: "Insufficient subscription", requiredPlan: minPlan },
        { status: 403 }
      );
    }
  }

  return null; // No error, continue
}
