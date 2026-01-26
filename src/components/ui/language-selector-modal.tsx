"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageSelectorModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    // Check if user has already selected a language
    const hasSelectedLanguage = localStorage.getItem("stagefinder-language-selected");
    if (!hasSelectedLanguage) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelectLanguage = (lang: "fr" | "en") => {
    setLanguage(lang);
    localStorage.setItem("stagefinder-language-selected", "true");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md mx-4"
          >
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                  <Globe className="h-8 w-8 text-zinc-400" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-serif font-light text-center text-white mb-2">
                Welcome to StageFinder
              </h2>
              <p className="text-sm text-zinc-500 text-center mb-8">
                Choose your preferred language
              </p>

              {/* Language Options */}
              <div className="space-y-3">
                <button
                  onClick={() => handleSelectLanguage("en")}
                  className={`w-full group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    language === "en"
                      ? "border-white bg-white/5"
                      : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">🇬🇧</span>
                      <div className="text-left">
                        <p className="text-[15px] font-medium text-white">English</p>
                        <p className="text-[12px] text-zinc-500">United Kingdom</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      language === "en" ? "border-white bg-white" : "border-zinc-700"
                    }`}>
                      {language === "en" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-black rounded-full"
                        />
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectLanguage("fr")}
                  className={`w-full group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    language === "fr"
                      ? "border-white bg-white/5"
                      : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">🇫🇷</span>
                      <div className="text-left">
                        <p className="text-[15px] font-medium text-white">Fran&ccedil;ais</p>
                        <p className="text-[12px] text-zinc-500">France</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      language === "fr" ? "border-white bg-white" : "border-zinc-700"
                    }`}>
                      {language === "fr" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-black rounded-full"
                        />
                      )}
                    </div>
                  </div>
                </button>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => {
                  localStorage.setItem("stagefinder-language-selected", "true");
                  setIsOpen(false);
                }}
                className="w-full mt-6 py-4 bg-white text-black font-medium text-sm rounded-xl hover:bg-zinc-200 transition-all duration-300 active:scale-[0.98]"
              >
                Continue
              </button>

              {/* Footer note */}
              <p className="text-[11px] text-zinc-600 text-center mt-4">
                You can change this later in settings
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
