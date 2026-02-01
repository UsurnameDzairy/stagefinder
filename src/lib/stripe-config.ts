// Stripe Price Configuration
// Update these IDs after creating products in Stripe Dashboard

export const STRIPE_PRICES = {
  student: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_STUDENT_MONTHLY || "price_student_monthly",
    yearly: process.env.NEXT_PUBLIC_STRIPE_STUDENT_YEARLY || "price_student_yearly",
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY || "price_pro_monthly",
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY || "price_pro_yearly",
  },
};

// Promo codes configuration (these should match Stripe Dashboard)
export const PROMO_CODES = {
  STUDENT50: {
    code: "STUDENT50",
    discount: 50,
    description: "50% off for students with .edu email",
    restrictions: ["edu_email"],
  },
  KAMVIP2024: {
    code: "KAMVIP2024",
    discount: 100,
    description: "VIP unlimited access",
  },
  FAMILYKAM: {
    code: "FAMILYKAM",
    discount: 30,
    description: "30% family discount",
  },
  PARTNERKAM: {
    code: "PARTNERKAM",
    discount: 100,
    description: "Partner VIP access",
  },
};

// Plan features for display
export const PLAN_FEATURES = {
  free: {
    aiQueries: 10,
    aiQueriesPeriod: "day",
    jobSearches: 1,
    jobSearchesPeriod: "day",
    coverLetters: 3,
    coverLettersPeriod: "month",
  },
  student: {
    aiQueries: 700,
    aiQueriesPeriod: "total",
    jobSearches: 3,
    jobSearchesPeriod: "day",
    coverLetters: 20,
    coverLettersPeriod: "month",
  },
  pro: {
    aiQueries: 50,
    aiQueriesPeriod: "day",
    jobSearches: 10,
    jobSearchesPeriod: "day",
    coverLetters: -1, // unlimited
    coverLettersPeriod: "unlimited",
  },
};
