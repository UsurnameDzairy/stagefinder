"use client";

import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useEffect, useRef, useState } from "react";

interface AIThinkingProps {
  model?: string;
}

export default function AIThinking({ model = "KAM" }: AIThinkingProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [timer, setTimer] = useState(0);

  const ThinkingContent = `Analyse du contexte de la demande et des informations fournies...

Examen du CV et identification des points clés : expériences professionnelles, formations, compétences techniques et soft skills...

Évaluation de la cohérence entre le profil et les objectifs de carrière mentionnés...

Recherche des secteurs et entreprises les plus pertinents en fonction du parcours académique et professionnel...

Analyse des tendances du marché de l'emploi dans les domaines ciblés...

Identification des compétences à mettre en avant et des axes d'amélioration potentiels...

Formulation de recommandations personnalisées basées sur le profil unique de l'utilisateur...

Structuration de la réponse pour maximiser la clarté et l'utilité des conseils...

Vérification de la pertinence et de l'applicabilité des suggestions proposées...

Préparation d'une réponse conversationnelle et naturelle, sans jargon inutile...

Finalisation de l'analyse et génération de la réponse optimale...`;

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      const clientHeight = contentRef.current.clientHeight;
      const maxScroll = scrollHeight - clientHeight;

      scrollIntervalRef.current = setInterval(() => {
        setScrollPosition((prev) => {
          const newPosition = prev + 1;
          if (newPosition >= maxScroll) {
            return 0;
          }
          return newPosition;
        });
      }, 30);

      return () => {
        if (scrollIntervalRef.current) {
          clearInterval(scrollIntervalRef.current);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  return (
    <div className="flex flex-col p-3 max-w-2xl">
      <div className="flex items-center justify-start gap-2 mb-4">
        <Loader size="sm" />
        <p
          className="bg-[linear-gradient(110deg,#404040,35%,#fff,50%,#404040,75%,#404040)] bg-[length:200%_100%] bg-clip-text text-base text-transparent font-serif"
          style={{
            animation: "shimmer 5s linear infinite",
          }}
        >
          {model} réfléchit
        </p>
        <span className="text-sm text-zinc-600">
          {timer}s
        </span>
        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}</style>
      </div>
      <Card className="relative h-[150px] overflow-hidden bg-zinc-900/50 border-zinc-800 p-2 rounded-xl">
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-30% from-zinc-900/50 to-transparent z-10 pointer-events-none h-[80px]" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-30% from-zinc-900/50 to-transparent z-10 pointer-events-none h-[80px]" />
        <div
          ref={contentRef}
          className="h-full overflow-hidden p-4 text-zinc-400"
          style={{
            scrollBehavior: "auto",
          }}
        >
          <p className="text-xs leading-relaxed whitespace-pre-wrap font-mono">
            {ThinkingContent}
          </p>
        </div>
      </Card>
    </div>
  );
}
