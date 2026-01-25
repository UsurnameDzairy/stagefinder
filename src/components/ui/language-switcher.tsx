'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
] as const;

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

export default function LanguageSwitcher({ className = '', variant = 'default' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'minimal') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-zinc-800 transition-all text-sm"
        >
          <span className="text-base">{currentLang.flag}</span>
          <span className="text-zinc-400 text-xs uppercase">{currentLang.code}</span>
        </button>

        {isOpen && (
          <div className="absolute top-full mt-1 right-0 w-36 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as 'fr' | 'en');
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-800 transition-colors ${
                  language === lang.code ? 'bg-zinc-800/50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span className="text-sm text-zinc-200">{lang.name}</span>
                </div>
                {language === lang.code && (
                  <Check className="h-4 w-4 text-emerald-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 transition-all text-sm"
      >
        <Globe className="h-4 w-4 text-zinc-400" />
        <span className="text-zinc-200">{currentLang.name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-44 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-zinc-800">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Langue / Language</span>
          </div>
          
          <div className="py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as 'fr' | 'en');
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 flex items-center justify-between hover:bg-zinc-800/50 transition-colors ${
                  language === lang.code ? 'bg-zinc-800/30' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-zinc-200">{lang.name}</span>
                </div>
                {language === lang.code && (
                  <Check className="h-4 w-4 text-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
