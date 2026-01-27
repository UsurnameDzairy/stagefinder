"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import Navbar from "@/components/ui/navbar";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface PricingPlan {
  key: "free" | "student" | "pro";
  price: string;
  yearlyPrice: string;
  href: string;
  isPopular?: boolean;
  stripePriceId?: string;
  stripeYearlyPriceId?: string;
}

const plansData: PricingPlan[] = [
  {
    key: "free",
    price: "0",
    yearlyPrice: "0",
    href: "/register",
    isPopular: false,
  },
  {
    key: "student",
    price: "10,79",
    yearlyPrice: "8,99",
    href: "#",
    isPopular: false,
    stripePriceId: "price_1Su4dcEZ2umRtYhgsugvViKb",
    stripeYearlyPriceId: "price_1Su4eQEZ2umRtYhgP0jQr3p6",
  },
  {
    key: "pro",
    price: "23,99",
    yearlyPrice: "19,99",
    href: "#",
    isPopular: true,
    stripePriceId: "price_1Su4b2EZ2umRtYhgqMjeLJXg",
    stripeYearlyPriceId: "price_1Su4bmEZ2umRtYhgXp1UEBLq",
  },
];

export default function PricingPage() {
  const { t, translations } = useTranslation();
  const { data: session } = useSession();
  const router = useRouter();
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
    // Si pas connecté, rediriger vers register avec le plan en paramètre
    if (!session?.user) {
      router.push(`/register?plan=${plan.key}&billing=${isMonthly ? 'monthly' : 'yearly'}`);
      return;
    }

    if (!plan.stripePriceId) return;

    setLoadingPlan(plan.key);
    try {
      const priceId = isMonthly ? plan.stripePriceId : plan.stripeYearlyPriceId;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          plan: plan.key,
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

  const handleFreePlan = () => {
    if (session?.user) {
      router.push("/dashboard");
    } else {
      router.push("/register");
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar user={session?.user} />

      <div className="pt-20 py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-4xl md:text-6xl mb-4 text-white">
              {t("pricing.title")} <span className="text-zinc-500 italic">{t("pricing.titleHighlight")}</span>
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
              {t("pricing.subtitle")}
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
                {t("pricing.monthly")}
              </button>
              <button
                onClick={() => handleToggle(false)}
                className={cn(
                  "relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  !isMonthly ? "text-black" : "text-zinc-500 hover:text-white"
                )}
              >
                {t("pricing.annual")}
              </button>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plansData.map((plan, index) => {
              const planData = translations.pricing?.plans?.[plan.key] || {
                name: plan.key,
                description: "",
                features: [],
                button: "Get Started"
              };

              return (
                <motion.div
                  key={plan.key}
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
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-zinc-700">
                      <span className="text-sm font-semibold text-white">{t("pricing.popular")}</span>
                    </div>
                  )}
                  <h3 className="font-serif text-xl text-white mb-2">{planData.name}</h3>
                  <p className={cn(
                    "text-sm italic mb-6",
                    plan.isPopular ? "text-zinc-400" : "text-zinc-500"
                  )}>
                    {planData.description}
                  </p>
                  <div className="mb-6">
                    <span className="font-serif text-5xl font-light text-white">
                      {isMonthly ? plan.price : plan.yearlyPrice}€
                    </span>
                    <span className={cn(
                      "font-serif text-sm ml-2 italic",
                      plan.isPopular ? "text-zinc-400" : "text-zinc-500"
                    )}>
                      {t("pricing.perMonth")}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mb-6 italic">
                    {isMonthly ? t("pricing.billedMonthly") : t("pricing.billedAnnually")}
                  </p>
                  <ul className={cn(
                    "space-y-3 mb-8 text-sm",
                    plan.isPopular ? "text-zinc-300" : "text-zinc-400"
                  )}>
                    {planData.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 font-serif">
                        <span className={plan.isPopular ? "text-white mt-0.5" : "text-zinc-500 mt-0.5"}>✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.stripePriceId ? (
                    <button
                      onClick={() => handleCheckout(plan)}
                      disabled={loadingPlan === plan.key}
                      className="w-full py-3 rounded-full font-serif transition-all disabled:opacity-50 bg-zinc-700 text-white font-semibold hover:bg-zinc-600"
                    >
                      {loadingPlan === plan.key ? t("common.loading") : planData.button}
                    </button>
                  ) : (
                    <button
                      onClick={handleFreePlan}
                      className="w-full py-3 rounded-full font-serif transition-all bg-zinc-700 text-white font-semibold hover:bg-zinc-600"
                    >
                      {planData.button}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
