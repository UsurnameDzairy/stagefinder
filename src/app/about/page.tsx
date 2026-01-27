"use client";

import { motion } from "framer-motion";
import TextType from "@/components/ui/text-type";
import { ArrowRight, Rocket, Heart, Users, Target } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import Navbar from "@/components/ui/navbar";
import { useSession } from "@/lib/auth-client";

export default function AboutPage() {
  const { t, tArray } = useTranslation();
  const { data: session } = useSession();

  const storyTexts = tArray("about.stories");
  const kamStatesTexts = tArray("about.kamStates");

  const missions = [
    {
      icon: Heart,
      title: t("about.missions.empowering.title"),
      description: t("about.missions.empowering.description")
    },
    {
      icon: Rocket,
      title: t("about.missions.funding.title"),
      description: t("about.missions.funding.description")
    },
    {
      icon: Users,
      title: t("about.missions.community.title"),
      description: t("about.missions.community.description")
    },
    {
      icon: Target,
      title: t("about.missions.barriers.title"),
      description: t("about.missions.barriers.description")
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar user={session?.user} />

      <div className="pt-20 pb-24">
        {/* Hero Section */}
        <section className="relative py-24 px-4 md:px-6 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* StageFinder Logo Style */}
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-normal tracking-tight mb-6">
                <span className="text-white">{t("about.title")} </span>
                <span className="text-zinc-500 italic">{t("about.titleHighlight")}</span>
              </h1>
              <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                {t("about.subtitle")}
              </p>
            </motion.div>
          </div>

          {/* Background gradient */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-zinc-900/20 rounded-full blur-[120px] pointer-events-none" />
        </section>

        {/* KAM Speaking Section */}
        <section className="py-24 px-4 md:px-6 border-t border-zinc-900">
          <div className="max-w-4xl mx-auto">
            {/* KAM Avatar */}
            <motion.div
              className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center border border-zinc-700">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <p className="text-white font-semibold">KAM</p>
                <TextType
                  text={kamStatesTexts}
                  className="text-zinc-600 text-sm"
                  typingSpeed={40}
                  deletingSpeed={20}
                  pauseDuration={2500}
                  initialDelay={300}
                  loop={true}
                  showCursor={false}
                />
              </div>
            </motion.div>

            {/* Typing Effect */}
            <motion.div
              className="bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <TextType
                text={storyTexts}
                className="text-zinc-400 text-lg md:text-xl lg:text-2xl leading-relaxed font-light"
                typingSpeed={30}
                deletingSpeed={15}
                pauseDuration={4000}
                initialDelay={500}
                loop={true}
                showCursor={true}
                cursorCharacter="|"
                cursorClassName="text-zinc-500"
                cursorBlinkDuration={0.6}
                variableSpeed={{ min: 20, max: 50 }}
              />
            </motion.div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-24 px-4 md:px-6 border-t border-zinc-900 bg-zinc-950/30">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-3xl md:text-5xl text-white mb-4">
                {t("about.missionTitle")} <span className="text-zinc-500 italic">{t("about.missionHighlight")}</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {missions.map((item, index) => (
                <motion.div
                  key={index}
                  className="p-8 bg-black border border-zinc-900 rounded-2xl hover:border-zinc-700 transition-all"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <item.icon className="h-8 w-8 text-zinc-600 mb-4" />
                  <h3 className="font-serif text-xl text-white mb-2">{item.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 md:px-6 border-t border-zinc-900">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-3xl md:text-5xl text-white mb-6">
              {t("about.ctaTitle")} <span className="text-zinc-500 italic">{t("about.ctaHighlight")}</span>
            </h2>
            <p className="text-zinc-500 text-lg mb-10 max-w-xl mx-auto">
              {t("about.ctaSubtitle")}
            </p>
            <Link href="/pricing">
              <button className="inline-flex items-center gap-4 px-10 py-4 bg-zinc-700 text-white font-serif italic text-lg rounded-full hover:bg-zinc-600 transition-all hover:scale-105 active:scale-95">
                {t("about.ctaButton")}
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
          </motion.div>
        </section>

        {/* Footer Note */}
        <section className="py-12 px-4 md:px-6 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700">
              {t("about.footer")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
