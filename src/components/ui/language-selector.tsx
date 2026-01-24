"use client";

import { useTranslation } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-900 rounded-lg p-0.5">
      <button
        onClick={() => setLanguage("fr")}
        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all duration-200 ${
          language === "fr"
            ? "bg-zinc-800 text-white shadow-sm"
            : "text-zinc-600 hover:text-zinc-400"
        }`}
      >
        {!compact && <Globe className="h-3 w-3 mr-1" />}
        FR
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all duration-200 ${
          language === "en"
            ? "bg-zinc-800 text-white shadow-sm"
            : "text-zinc-600 hover:text-zinc-400"
        }`}
      >
        {!compact && <Globe className="h-3 w-3 mr-1" />}
        EN
      </button>
    </div>
  );
}
