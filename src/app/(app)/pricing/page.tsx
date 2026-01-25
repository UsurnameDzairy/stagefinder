"use client";

import { motion, useSpring } from "framer-motion";
import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { Check, Star as LucideStar } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// --- INTERACTIVE STARFIELD ---

function Star({
  mousePosition,
  containerRef,
}: {
  mousePosition: { x: number | null; y: number | null };
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [initialPos] = useState({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
  });

  const springConfig = { stiffness: 100, damping: 15, mass: 0.1 };
  const springX = useSpring(0, springConfig);
  const springY = useSpring(0, springConfig);

  useEffect(() => {
    if (
      !containerRef.current ||
      mousePosition.x === null ||
      mousePosition.y === null
    ) {
      springX.set(0);
      springY.set(0);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const starX =
      containerRect.left +
      (parseFloat(initialPos.left) / 100) * containerRect.width;
    const starY =
      containerRect.top +
      (parseFloat(initialPos.top) / 100) * containerRect.height;

    const deltaX = mousePosition.x - starX;
    const deltaY = mousePosition.y - starY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const radius = 600;

    if (distance < radius) {
      const force = 1 - distance / radius;
      const pullX = deltaX * force * 0.5;
      const pullY = deltaY * force * 0.5;
      springX.set(pullX);
      springY.set(pullY);
    } else {
      springX.set(0);
      springY.set(0);
    }
  }, [mousePosition, initialPos, containerRef, springX, springY]);

  return (
    <motion.div
      className="absolute bg-white rounded-full"
      style={{
        top: initialPos.top,
        left: initialPos.left,
        width: `${1 + Math.random() * 2}px`,
        height: `${1 + Math.random() * 2}px`,
        x: springX,
        y: springY,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{
        duration: 2 + Math.random() * 3,
        repeat: Infinity,
        delay: Math.random() * 5,
      }}
    />
  );
}

function InteractiveStarfield({
  mousePosition,
  containerRef,
}: {
  mousePosition: { x: number | null; y: number | null };
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {Array.from({ length: 150 }).map((_, i) => (
        <Star
          key={`star-${i}`}
          mousePosition={mousePosition}
          containerRef={containerRef}
        />
      ))}
    </div>
  );
}

// --- PRICING COMPONENT LOGIC ---

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

const PricingContext = createContext<{
  isMonthly: boolean;
  setIsMonthly: (value: boolean) => void;
}>({
  isMonthly: true,
  setIsMonthly: () => {},
});

// Pricing Toggle Component
function PricingToggle() {
  const { isMonthly, setIsMonthly } = useContext(PricingContext);
  const confettiRef = useRef<HTMLDivElement>(null);
  const monthlyBtnRef = useRef<HTMLButtonElement>(null);
  const annualBtnRef = useRef<HTMLButtonElement>(null);

  const [pillStyle, setPillStyle] = useState({});

  useEffect(() => {
    const btnRef = isMonthly ? monthlyBtnRef : annualBtnRef;
    if (btnRef.current) {
      setPillStyle({
        width: btnRef.current.offsetWidth,
        transform: `translateX(${btnRef.current.offsetLeft}px)`,
      });
    }
  }, [isMonthly]);

  const handleToggle = (monthly: boolean) => {
    if (isMonthly === monthly) return;
    setIsMonthly(monthly);

    if (!monthly && confettiRef.current) {
      const rect = annualBtnRef.current?.getBoundingClientRect();
      if (!rect) return;

      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { x: originX, y: originY },
        colors: ["#ffffff", "#a1a1aa", "#71717a"],
        ticks: 300,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
      });
    }
  };

  return (
    <div className="flex justify-center">
      <div ref={confettiRef} className="relative flex w-fit items-center rounded-full bg-zinc-900 p-1 border border-zinc-800">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-white p-1"
          style={pillStyle}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
        <button
          ref={monthlyBtnRef}
          onClick={() => handleToggle(true)}
          className={cn(
            "relative z-10 rounded-full px-4 sm:px-6 py-2 text-sm font-medium transition-colors",
            isMonthly
              ? "text-black"
              : "text-zinc-500 hover:text-white",
          )}
        >
          Mensuel
        </button>
        <button
          ref={annualBtnRef}
          onClick={() => handleToggle(false)}
          className={cn(
            "relative z-10 rounded-full px-4 sm:px-6 py-2 text-sm font-medium transition-colors",
            !isMonthly
              ? "text-black"
              : "text-zinc-500 hover:text-white",
          )}
        >
          Annuel
          <span
            className={cn(
              "hidden sm:inline ml-1",
              !isMonthly ? "text-black/70" : "text-zinc-600",
            )}
          >
            (-20%)
          </span>
        </button>
      </div>
    </div>
  );
}

// Pricing Card Component
function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const { isMonthly } = useContext(PricingContext);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const handleCheckout = async () => {
    if (!plan.stripePriceId) return;
    
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{
        y: plan.isPopular && isDesktop ? -20 : 0,
        opacity: 1,
      }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: index * 0.15,
      }}
      className={cn(
        "rounded-2xl p-8 flex flex-col relative backdrop-blur-sm",
        plan.isPopular
          ? "border-2 border-white bg-zinc-900/80 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          : "border border-zinc-800 bg-black/50",
      )}
    >
      {plan.isPopular && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
          <div className="bg-white py-1.5 px-4 rounded-full flex items-center gap-1.5">
            <LucideStar className="text-black h-4 w-4 fill-current" />
            <span className="text-black text-sm font-semibold">
              Populaire
            </span>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col text-center">
        <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
        <p className="mt-2 text-sm text-zinc-500">
          {plan.description}
        </p>
        <div className="mt-6 flex items-baseline justify-center gap-x-1">
          <span className="text-5xl font-bold tracking-tight text-white">
            <NumberFlow
              value={
                isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
              }
              format={{
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
              }}
              className="font-variant-numeric: tabular-nums"
            />
          </span>
          <span className="text-sm font-semibold leading-6 tracking-wide text-zinc-500">
            / {plan.period}
          </span>
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          {isMonthly ? "Facturation mensuelle" : "Facturation annuelle"}
        </p>

        <ul
          role="list"
          className="mt-8 space-y-3 text-sm leading-6 text-left text-zinc-400"
        >
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-x-3">
              <Check
                className="h-6 w-5 flex-none text-white"
                aria-hidden="true"
              />
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          {plan.stripePriceId ? (
            <Button
              onClick={handleCheckout}
              disabled={isLoading}
              variant={plan.isPopular ? "default" : "outline"}
              size="lg"
              className={cn(
                "w-full",
                plan.isPopular 
                  ? "bg-white text-black hover:bg-zinc-200" 
                  : "border-zinc-700 text-white hover:bg-zinc-800"
              )}
            >
              {isLoading ? "Chargement..." : plan.buttonText}
            </Button>
          ) : (
            <Link href={plan.href} className="block">
              <Button
                variant={plan.isPopular ? "default" : "outline"}
                size="lg"
                className={cn(
                  "w-full",
                  plan.isPopular 
                    ? "bg-white text-black hover:bg-zinc-200" 
                    : "border-zinc-700 text-white hover:bg-zinc-800"
                )}
              >
                {plan.buttonText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Plans data with Stripe price IDs
const plans: PricingPlan[] = [
  {
    name: "Student",
    price: "10",
    yearlyPrice: "8",
    period: "mois",
    description: "Pour les étudiants qui démarrent",
    features: [
      "10 requêtes IA par jour",
      "70 requêtes IA par semaine",
      "Accès aux offres de stages",
      "Analyse de CV basique",
      "Alertes email quotidiennes",
      "Support communautaire",
    ],
    buttonText: "Commencer",
    href: "#",
    isPopular: false,
    stripePriceId: "price_1StIZXQD4Pt8cZCMR1QR2Rnt",
    stripeYearlyPriceId: "price_1StIZXQD4Pt8cZCMJGBbUswp",
  },
  {
    name: "Pro",
    price: "23",
    yearlyPrice: "18",
    period: "mois",
    description: "Pour les chercheurs actifs",
    features: [
      "50 requêtes IA par jour",
      "350 requêtes IA par semaine",
      "Accès illimité aux offres",
      "Analyse CV avancée par IA",
      "Génération lettres de motivation",
      "Alertes en temps réel",
      "Support prioritaire",
    ],
    buttonText: "Essayer gratuitement",
    href: "#",
    isPopular: true,
    stripePriceId: "price_1StIZYQD4Pt8cZCM0Xlrww0i",
    stripeYearlyPriceId: "price_1StIZYQD4Pt8cZCMVuwSXF3U",
  },
  {
    name: "Enterprise",
    price: "50",
    yearlyPrice: "40",
    period: "mois",
    description: "Pour les professionnels exigeants",
    features: [
      "Requêtes IA illimitées",
      "Accès API complet",
      "Analyse CV premium + coaching",
      "Génération automatique de candidatures",
      "Suivi avancé des candidatures",
      "Account manager dédié",
      "Intégrations personnalisées",
      "Support 24/7",
    ],
    buttonText: "Contacter les ventes",
    href: "#",
    isPopular: false,
    stripePriceId: "price_1StIZZQD4Pt8cZCMLAGoOQOw",
    stripeYearlyPriceId: "price_1StIZZQD4Pt8cZCMUutRRiAc",
  },
];

// Main Page Component
export default function PricingPage() {
  const [isMonthly, setIsMonthly] = useState(true);
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number | null;
    y: number | null;
  }>({ x: null, y: null });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = event;
    setMousePosition({ x: clientX, y: clientY });
  };

  const translations = {
    fr: {
      title: "Tarifs",
      subtitle: "simples",
      description: "Choisissez le plan adapté à vos besoins.\nTous les plans incluent nos fonctionnalités essentielles.",
    },
    en: {
      title: "Pricing",
      subtitle: "Plans",
      description: "Choose the plan that fits your needs.\nAll plans include our essential features.",
    },
  };

  const t = translations[language];

  return (
    <PricingContext.Provider value={{ isMonthly, setIsMonthly }}>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePosition({ x: null, y: null })}
        className="relative w-full min-h-screen bg-black py-20 sm:py-24"
      >
        <InteractiveStarfield
          mousePosition={mousePosition}
          containerRef={containerRef}
        />
        <div className="relative z-10 container mx-auto px-4 md:px-6">
          {/* Language Switcher */}
          <div className="absolute top-8 right-8 flex gap-2">
            <button
              onClick={() => setLanguage("fr")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                language === "fr"
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-500 hover:text-white"
              )}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                language === "en"
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-500 hover:text-white"
              )}
            >
              EN
            </button>
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <Link href="/pricing" className="inline-block group">
              <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-white transition-colors group-hover:text-zinc-300 cursor-pointer">
                {t.title} <span className="text-zinc-500 italic">{t.subtitle}</span>
              </h1>
            </Link>
            <p className="text-zinc-500 text-lg">
              {t.description}
            </p>
          </div>
          <PricingToggle />
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 items-start gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <PricingCard key={index} plan={plan} index={index} />
            ))}
          </div>
        </div>
      </div>
    </PricingContext.Provider>
  );
}
