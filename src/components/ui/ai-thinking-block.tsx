"use client";

import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n";

export default function AIThinkingBlock() {
    const { t } = useTranslation();
    const [scrollPosition, setScrollPosition] = useState(0);
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Get thinking phrases from translations
    const thinkingPhrases = (t("assistantPage.thinking") as unknown as string[]) || [
        "KAM analyse votre demande",
        "KAM réfléchit",
        "KAM élabore une réponse"
    ];

    // Messages de pensée pour l'animation
    const ThinkingContent = `Je commence par analyser votre demande en détail. Il est important de bien comprendre le contexte et vos besoins spécifiques avant de formuler une réponse appropriée.

Je consulte maintenant mes connaissances sur le sujet. Je cherche les informations les plus pertinentes et actualisées pour vous fournir une réponse de qualité.

Je prends en compte votre profil et votre parcours. Chaque situation est unique, et il est essentiel d'adapter mes conseils à votre contexte particulier.

J'évalue différentes approches possibles. Il existe souvent plusieurs façons d'aborder une problématique, et je veux vous présenter celle qui vous conviendra le mieux.

Je structure ma réponse pour qu'elle soit claire et actionnable. L'objectif est de vous fournir des conseils concrets que vous pourrez mettre en pratique immédiatement.

Je vérifie la cohérence de mon analyse. Il est important que tous les éléments de ma réponse s'articulent logiquement entre eux.

Je m'assure que ma réponse est personnalisée. Les conseils génériques ne sont pas suffisants - vous méritez une analyse qui tient compte de votre situation spécifique.

Je finalise la formulation pour qu'elle soit naturelle et humaine. Je veux que vous ayez l'impression de discuter avec un conseiller expérimenté, pas avec une machine.

Presque terminé - je révise une dernière fois pour m'assurer que je n'ai rien oublié. Votre question mérite une réponse complète et bien pensée.

C'est parfait, je suis prêt à vous partager mon analyse et mes recommandations. J'espère qu'elles vous seront utiles pour avancer dans votre projet professionnel.`;

    const [timer, setTimer] = useState(0);

    // Timer for elapsed time
    useEffect(() => {
        const timerInterval = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);

        return () => {
            clearInterval(timerInterval);
        };
    }, []);

    // Rotate through thinking phrases
    useEffect(() => {
        const phraseInterval = setInterval(() => {
            setCurrentPhraseIndex((prev) => (prev + 1) % thinkingPhrases.length);
        }, 2500);

        return () => {
            clearInterval(phraseInterval);
        };
    }, [thinkingPhrases.length]);

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
            }, 20);

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
        <div className="flex flex-col p-0 max-w-xl w-full">
            <div className="flex items-center justify-start gap-2 mb-4">
                <Loader2 className="size-4 animate-spin text-zinc-500" />
                <p
                    className="bg-[linear-gradient(110deg,#52525b,35%,#e4e4e7,50%,#52525b,75%,#52525b)] bg-[length:200%_100%] bg-clip-text text-sm text-transparent transition-all duration-300"
                    style={{
                        animation: "shimmer 3s linear infinite",
                    }}
                >
                    {thinkingPhrases[currentPhraseIndex]}
                </p>
                <span className="text-xs text-zinc-600">
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
                {/* Top fade overlay */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-30% from-zinc-900/50 to-transparent z-10 pointer-events-none h-[80px]" />

                {/* Bottom fade overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-30% from-zinc-900/50 to-transparent z-10 pointer-events-none h-[80px]" />

                {/* Scrolling content */}
                <div
                    ref={contentRef}
                    className="h-full overflow-hidden p-4 text-zinc-400"
                    style={{
                        scrollBehavior: "auto",
                    }}
                >
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">
                        {ThinkingContent}
                    </p>
                </div>
            </Card>
        </div>
    );
}
