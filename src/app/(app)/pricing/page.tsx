"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular?: boolean;
  stripePriceId?: string;
  stripeYearlyPriceId?: string;
}

const plans: PricingPlan[] = [
  {
    name: "Free",
    price: "0",
    yearlyPrice: "0",
    period: "month",
    description: "To discover the platform",
    features: [
      "5 applications every 3 days",
      "Limited access to offers",
      "Basic search",
    ],
    buttonText: "Start for free",
    href: "/sign-up",
    isPopular: false,
  },
  {
    name: "Student",
    price: "8.99",
    yearlyPrice: "7.19",
    period: "month",
    description: "For students getting started",
    features: [
      "10 applications per day",
      "700 total AI requests",
      "AI writing (letters, follow-ups)",
      "Application tracking",
    ],
    buttonText: "Get Started",
    href: "#",
    isPopular: false,
    stripePriceId: "price_1StIZXQD4Pt8cZCMR1QR2Rnt",
    stripeYearlyPriceId: "price_1StIZXQD4Pt8cZCMJGBbUswp",
  },
  {
    name: "Pro",
    price: "19.99",
    yearlyPrice: "15.99",
    period: "month",
    description: "For active job seekers",
    features: [
      "10 applications per day",
      "1500 total AI requests",
      "Unlimited access to offers",
      "Cover letter generation",
      "Real-time alerts",
    ],
    buttonText: "Try for free",
    href: "#",
    isPopular: true,
    stripePriceId: "price_1StIZYQD4Pt8cZCM0Xlrww0i",
    stripeYearlyPriceId: "price_1StIZYQD4Pt8cZCMVuwSXF3U",
  },
];

export default function PricingPage() {
  const [isMonthly, setIsMonthly] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleToggle = (monthly: boolean) => {
    if (isMonthly === monthly) return;
    setIsMonthly(monthly);

    if (!monthly) {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { x: 0.5, y: 0.3 },
        colors: ["#ffffff", "#a1a1aa", "#71717a"],
        ticks: 300,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
      });
    }
  };

  const handleCheckout = async (plan: PricingPlan) => {
    if (!plan.stripePriceId) return;

    setLoadingPlan(plan.name);
    try {
      const priceId = isMonthly ? plan.stripePriceId : plan.stripeYearlyPriceId;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          plan: plan.name.toLowerCase(),
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-black py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-4xl md:text-6xl mb-4 text-white">
            Pricing <span className="text-zinc-500 italic">Plans</span>
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
            Choose the strategy that fits your career goals.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative flex items-center rounded-full bg-zinc-900 p-1 border border-zinc-800">
            <div
              className={cn(
                "absolute h-[calc(100%-8px)] rounded-full bg-white transition-all duration-300",
                isMonthly ? "left-1 w-[85px]" : "left-[89px] w-[115px]"
              )}
            />
            <button
              onClick={() => handleToggle(true)}
              className={cn(
                "relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isMonthly ? "text-black" : "text-zinc-500 hover:text-white"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => handleToggle(false)}
              className={cn(
                "relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                !isMonthly ? "text-black" : "text-zinc-500 hover:text-white"
              )}
            >
              Annual (-20%)
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={cn(
                "rounded-2xl p-8 border backdrop-blur-sm hover:border-zinc-700 transition-all",
                plan.isPopular
                  ? "border-2 border-white bg-zinc-900/80 relative md:-translate-y-4"
                  : "border-zinc-800 bg-black/50"
              )}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white">
                  <span className="text-sm font-semibold text-black">Popular</span>
                </div>
              )}
              <h3 className="font-serif text-xl text-white mb-2">{plan.name}</h3>
              <p className={cn(
                "text-sm italic mb-6",
                plan.isPopular ? "text-zinc-400" : "text-zinc-500"
              )}>
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="font-serif text-5xl font-light text-white">
                  ${isMonthly ? plan.price : plan.yearlyPrice}
                </span>
                <span className={cn(
                  "font-serif text-sm ml-2 italic",
                  plan.isPopular ? "text-zinc-400" : "text-zinc-500"
                )}>
                  / {plan.period}
                </span>
              </div>
              <p className="text-xs text-zinc-600 mb-6 italic">
                {isMonthly ? "Billed monthly" : "Billed annually"}
              </p>
              <ul className={cn(
                "space-y-3 mb-8 text-sm",
                plan.isPopular ? "text-zinc-300" : "text-zinc-400"
              )}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 font-serif">
                    <span className={plan.isPopular ? "text-white mt-0.5" : "text-zinc-500 mt-0.5"}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.stripePriceId ? (
                <button
                  onClick={() => handleCheckout(plan)}
                  disabled={loadingPlan === plan.name}
                  className={cn(
                    "w-full py-3 rounded-full font-serif transition-all disabled:opacity-50",
                    plan.isPopular
                      ? "bg-white text-black font-semibold hover:bg-zinc-200"
                      : "border border-zinc-700 text-white hover:bg-zinc-800"
                  )}
                >
                  {loadingPlan === plan.name ? "Loading..." : plan.buttonText}
                </button>
              ) : (
                <Link href={plan.href} className="block">
                  <button
                    className={cn(
                      "w-full py-3 rounded-full font-serif transition-all",
                      plan.isPopular
                        ? "bg-white text-black font-semibold hover:bg-zinc-200"
                        : "border border-zinc-700 text-white hover:bg-zinc-800"
                    )}
                  >
                    {plan.buttonText}
                  </button>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
