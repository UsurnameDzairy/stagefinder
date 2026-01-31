/**
 * Subscription plan limits and feature access control
 */

export type PlanType = 'FREE' | 'STUDENT' | 'PRO';

export interface PlanLimits {
  aiRequestsPerDay: number;
  aiRequestsTotal: number | null; // null = unlimited
  jobSearchesPerDay: number;
  hasUnlimitedOffers: boolean;
  hasCVAnalysis: boolean;
  hasCoverLetterGeneration: boolean;
  hasEmailAlerts: boolean;
  hasRealtimeAlerts: boolean;
  hasPrioritySupport: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  FREE: {
    aiRequestsPerDay: 10,
    aiRequestsTotal: null,
    jobSearchesPerDay: 1,
    hasUnlimitedOffers: false,
    hasCVAnalysis: false,
    hasCoverLetterGeneration: false,
    hasEmailAlerts: false,
    hasRealtimeAlerts: false,
    hasPrioritySupport: false,
  },
  STUDENT: {
    aiRequestsPerDay: Infinity, // No daily limit, only total
    aiRequestsTotal: 700,
    jobSearchesPerDay: 3,
    hasUnlimitedOffers: false,
    hasCVAnalysis: true,
    hasCoverLetterGeneration: false,
    hasEmailAlerts: true,
    hasRealtimeAlerts: false,
    hasPrioritySupport: false,
  },
  PRO: {
    aiRequestsPerDay: 50,
    aiRequestsTotal: 1500,
    jobSearchesPerDay: 10,
    hasUnlimitedOffers: true,
    hasCVAnalysis: true,
    hasCoverLetterGeneration: true,
    hasEmailAlerts: true,
    hasRealtimeAlerts: true,
    hasPrioritySupport: true,
  },
};

/**
 * Check if user has reached their AI request limit
 */
export function hasReachedAILimit(
  plan: PlanType,
  aiRequestsUsed: number,
  lastResetAt: Date
): boolean {
  const limits = PLAN_LIMITS[plan];
  
  // Check if we need to reset daily counter
  const now = new Date();
  const hoursSinceReset = (now.getTime() - lastResetAt.getTime()) / (1000 * 60 * 60);
  const shouldReset = hoursSinceReset >= 24;
  
  if (shouldReset) {
    return false; // Will be reset
  }
  
  // Check total limit (for STUDENT plan)
  if (limits.aiRequestsTotal !== null && aiRequestsUsed >= limits.aiRequestsTotal) {
    return true;
  }
  
  // Check daily limit
  if (limits.aiRequestsPerDay !== Infinity && aiRequestsUsed >= limits.aiRequestsPerDay) {
    return true;
  }
  
  return false;
}

/**
 * Check if user has reached their job search limit
 */
export function hasReachedJobSearchLimit(
  plan: PlanType,
  jobSearchesUsed: number,
  lastResetAt: Date
): boolean {
  const limits = PLAN_LIMITS[plan];
  
  // Check if we need to reset daily counter
  const now = new Date();
  const hoursSinceReset = (now.getTime() - lastResetAt.getTime()) / (1000 * 60 * 60);
  const shouldReset = hoursSinceReset >= 24;
  
  if (shouldReset) {
    return false; // Will be reset
  }
  
  return jobSearchesUsed >= limits.jobSearchesPerDay;
}

/**
 * Check if user has access to a specific feature
 */
export function hasFeatureAccess(plan: PlanType, feature: keyof Omit<PlanLimits, 'aiRequestsPerDay' | 'aiRequestsTotal' | 'jobSearchesPerDay'>): boolean {
  return PLAN_LIMITS[plan][feature];
}

/**
 * Get remaining AI requests for today
 */
export function getRemainingAIRequests(
  plan: PlanType,
  aiRequestsUsed: number,
  aiRequestsTotal: number | null,
  lastResetAt: Date
): number {
  const limits = PLAN_LIMITS[plan];
  
  // Check if we need to reset
  const now = new Date();
  const hoursSinceReset = (now.getTime() - lastResetAt.getTime()) / (1000 * 60 * 60);
  const shouldReset = hoursSinceReset >= 24;
  
  if (shouldReset) {
    return limits.aiRequestsPerDay === Infinity ? Infinity : limits.aiRequestsPerDay;
  }
  
  // For STUDENT plan, check total limit
  if (plan === 'STUDENT' && limits.aiRequestsTotal !== null) {
    const remaining = limits.aiRequestsTotal - aiRequestsUsed;
    return Math.max(0, remaining);
  }
  
  // For other plans, check daily limit
  if (limits.aiRequestsPerDay === Infinity) {
    return Infinity;
  }
  
  const remaining = limits.aiRequestsPerDay - aiRequestsUsed;
  return Math.max(0, remaining);
}

/**
 * Get remaining job searches for today
 */
export function getRemainingJobSearches(
  plan: PlanType,
  jobSearchesUsed: number,
  lastResetAt: Date
): number {
  const limits = PLAN_LIMITS[plan];
  
  // Check if we need to reset
  const now = new Date();
  const hoursSinceReset = (now.getTime() - lastResetAt.getTime()) / (1000 * 60 * 60);
  const shouldReset = hoursSinceReset >= 24;
  
  if (shouldReset) {
    return limits.jobSearchesPerDay;
  }
  
  const remaining = limits.jobSearchesPerDay - jobSearchesUsed;
  return Math.max(0, remaining);
}
