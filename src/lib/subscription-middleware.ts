import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PlanType, hasReachedAILimit, hasReachedJobSearchLimit, hasFeatureAccess } from "./subscription-limits";

export interface SubscriptionCheck {
  allowed: boolean;
  plan: PlanType;
  remaining?: number;
  message?: string;
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
    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        plan: "FREE",
        status: "ACTIVE",
      },
    });
    
    return {
      allowed: true,
      plan: "FREE" as PlanType,
      remaining: 9, // 10 - 1 (this request)
    };
  }

  const plan = subscription.plan as PlanType;
  
  // Check if user has reached limit
  const hasReached = hasReachedAILimit(
    plan,
    subscription.aiRequestsUsed,
    subscription.lastResetAt
  );

  if (hasReached) {
    return {
      allowed: false,
      plan,
      message: plan === "STUDENT" 
        ? "Vous avez atteint votre limite de 700 requêtes IA. Passez au plan Pro pour continuer."
        : "Limite quotidienne atteinte. Revenez demain ou passez à un plan supérieur.",
    };
  }

  // Check if we need to reset daily counter
  const now = new Date();
  const hoursSinceReset = (now.getTime() - subscription.lastResetAt.getTime()) / (1000 * 60 * 60);
  const shouldReset = hoursSinceReset >= 24;

  if (shouldReset) {
    // Reset daily counters
    await prisma.subscription.update({
      where: { userId },
      data: {
        aiRequestsUsed: 0,
        jobSearchesUsed: 0,
        lastResetAt: now,
      },
    });
  }

  return {
    allowed: true,
    plan,
  };
}

/**
 * Increment AI request usage
 */
export async function incrementAIUsage(userId: string): Promise<void> {
  await prisma.subscription.update({
    where: { userId },
    data: {
      aiRequestsUsed: {
        increment: 1,
      },
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
    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        plan: "FREE",
        status: "ACTIVE",
      },
    });
    
    return {
      allowed: true,
      plan: "FREE" as PlanType,
      remaining: 0, // 1 - 1 (this request)
    };
  }

  const plan = subscription.plan as PlanType;
  
  const hasReached = hasReachedJobSearchLimit(
    plan,
    subscription.jobSearchesUsed,
    subscription.lastResetAt
  );

  if (hasReached) {
    return {
      allowed: false,
      plan,
      message: "Limite quotidienne de recherches d'emploi atteinte. Passez à un plan supérieur.",
    };
  }

  // Check if we need to reset
  const now = new Date();
  const hoursSinceReset = (now.getTime() - subscription.lastResetAt.getTime()) / (1000 * 60 * 60);
  const shouldReset = hoursSinceReset >= 24;

  if (shouldReset) {
    await prisma.subscription.update({
      where: { userId },
      data: {
        aiRequestsUsed: 0,
        jobSearchesUsed: 0,
        lastResetAt: now,
      },
    });
  }

  return {
    allowed: true,
    plan,
  };
}

/**
 * Increment job search usage
 */
export async function incrementJobSearchUsage(userId: string): Promise<void> {
  await prisma.subscription.update({
    where: { userId },
    data: {
      jobSearchesUsed: {
        increment: 1,
      },
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
  const allowed = hasFeatureAccess(plan, feature);

  if (!allowed) {
    return {
      allowed: false,
      plan,
      message: "Cette fonctionnalité nécessite un abonnement supérieur.",
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
        { error: "Abonnement insuffisant", requiredPlan: minPlan },
        { status: 403 }
      );
    }
  }

  return null; // No error, continue
}
