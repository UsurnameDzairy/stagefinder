"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Language } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tArray: (key: string) => string[];
  translations: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Charger la langue depuis localStorage au démarrage
  useEffect(() => {
    const savedLang = localStorage.getItem("stagefinder-language") as Language;
    if (savedLang && (savedLang === "fr" || savedLang === "en")) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("stagefinder-language", lang);
  };

  // Fonction de traduction avec support des clés imbriquées (ex: "nav.dashboard")
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === "string" ? value : key;
  };

  // Fonction de traduction pour les tableaux de chaînes
  const tArray = (key: string): string[] => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return [];
      }
    }

    return Array.isArray(value) ? value : [];
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        tArray,
        translations: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Hook simplifié pour accéder aux traductions
export function useTranslation() {
  const { t, tArray, language, setLanguage, translations } = useLanguage();
  return { t, tArray, language, setLanguage, translations };
}
