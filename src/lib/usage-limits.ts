import { prisma } from "@/lib/prisma";

// Plan limits configuration
// FREE: 3 applications + 2 searches every 3 days
// STUDENT: 10 applications + 4 searches per day
// PRO: 20 applications + 8 searches per day

export const PLAN_LIMITS = {
  FREE: {
    applications: 3,
    searches: 2,
    periodDays: 3, // Every 3 days
  },
  STUDENT: {
    applications: 10,
    searches: 4,
    periodDays: 1, // Daily
  },
  PRO: {
    applications: 20,
    searches: 8,
    periodDays: 1, // Daily
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
export type UsageType = "application" | "search";

/**
 * Get the user's current plan
 */
export async function getUserPlan(userId: string): Promise<PlanType> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });

  if (!subscription || subscription.status !== "ACTIVE") {
    return "FREE";
  }

  // Map database plan to our plan types
  const plan = subscription.plan as string;
  if (plan === "STUDENT") return "STUDENT";
  if (plan === "PRO") return "PRO";
  return "FREE";
}

/**
 * Calculate the period start date based on plan
 */
function getPeriodStart(plan: PlanType): Date {
  const now = new Date();
  const periodDays = PLAN_LIMITS[plan].periodDays;

  if (periodDays === 1) {
    // Daily reset at midnight
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else {
    // For multi-day periods, calculate based on a reference date
    // We use a fixed reference point and calculate which period we're in
    const referenceDate = new Date("2024-01-01");
    const daysSinceReference = Math.floor(
      (now.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const periodNumber = Math.floor(daysSinceReference / periodDays);
    const periodStartDays = periodNumber * periodDays;

    const periodStart = new Date(referenceDate);
    periodStart.setDate(periodStart.getDate() + periodStartDays);
    return periodStart;
  }
}

/**
 * Calculate the period end date based on plan
 */
function getPeriodEnd(plan: PlanType, periodStart: Date): Date {
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + PLAN_LIMITS[plan].periodDays);
  return periodEnd;
}

/**
 * Get current usage for a user
 */
export async function getUsage(
  userId: string,
  type: UsageType
): Promise<{ used: number; limit: number; remaining: number; resetsAt: Date; plan: PlanType }> {
  const plan = await getUserPlan(userId);
  const periodStart = getPeriodStart(plan);
  const periodEnd = getPeriodEnd(plan, periodStart);
  const limit = type === "application"
    ? PLAN_LIMITS[plan].applications
    : PLAN_LIMITS[plan].searches;

  // Get or create usage tracking record
  let tracking = await prisma.usageTracking.findUnique({
    where: {
      userId_type_periodStart: {
        userId,
        type,
        periodStart,
      },
    },
  });

  // If no tracking record exists or it's expired, the count is 0
  const used = tracking?.count || 0;

  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    resetsAt: periodEnd,
    plan,
  };
}

/**
 * Check if user can perform an action
 */
export async function canPerformAction(
  userId: string,
  type: UsageType
): Promise<{ allowed: boolean; reason?: string; usage: Awaited<ReturnType<typeof getUsage>> }> {
  const usage = await getUsage(userId, type);

  if (usage.remaining <= 0) {
    const actionName = type === "application" ? "applications" : "searches";
    const resetTime = usage.resetsAt.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      allowed: false,
      reason: `You've reached your ${actionName} limit (${usage.limit}/${usage.plan === "FREE" ? "3 days" : "day"}). Resets on ${resetTime}. Upgrade for more.`,
      usage,
    };
  }

  return { allowed: true, usage };
}

/**
 * Increment usage counter for an action
 */
export async function incrementUsage(
  userId: string,
  type: UsageType
): Promise<{ success: boolean; usage: Awaited<ReturnType<typeof getUsage>> }> {
  const plan = await getUserPlan(userId);
  const periodStart = getPeriodStart(plan);
  const periodEnd = getPeriodEnd(plan, periodStart);

  // Upsert the usage tracking record
  await prisma.usageTracking.upsert({
    where: {
      userId_type_periodStart: {
        userId,
        type,
        periodStart,
      },
    },
    create: {
      userId,
      type,
      periodStart,
      periodEnd,
      count: 1,
    },
    update: {
      count: { increment: 1 },
    },
  });

  const usage = await getUsage(userId, type);
  return { success: true, usage };
}

/**
 * Get all usage stats for a user (for dashboard display)
 */
export async function getAllUsageStats(userId: string): Promise<{
  plan: PlanType;
  applications: { used: number; limit: number; remaining: number; resetsAt: Date };
  searches: { used: number; limit: number; remaining: number; resetsAt: Date };
}> {
  const [applications, searches] = await Promise.all([
    getUsage(userId, "application"),
    getUsage(userId, "search"),
  ]);

  return {
    plan: applications.plan,
    applications: {
      used: applications.used,
      limit: applications.limit,
      remaining: applications.remaining,
      resetsAt: applications.resetsAt,
    },
    searches: {
      used: searches.used,
      limit: searches.limit,
      remaining: searches.remaining,
      resetsAt: searches.resetsAt,
    },
  };
}
