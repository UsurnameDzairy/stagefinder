"use client";

import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation, useLanguage } from "@/lib/i18n";

export default function AIThinkingBlock() {
    const { tArray, t } = useTranslation();
    const { language } = useLanguage();
    const [scrollPosition, setScrollPosition] = useState(0);
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Get thinking phrases from translations
    const rawThinkingPhrases = tArray("assistantPage.thinking");
    const thinkingPhrases = rawThinkingPhrases.length > 0
        ? rawThinkingPhrases
        : [
            "Taking a closer look...",
            "Let me think about this...",
            "Considering your profile...",
            "Working on it...",
            "Almost there..."
        ];

    // Thinking content based on language
    const ThinkingContent = language === "fr"
        ? `Hmm, laisse-moi prendre un moment pour bien comprendre ce que tu me demandes...

Alors en regardant ton profil et ce que tu m'as partagé, je commence à voir des patterns intéressants.

Je réfléchis à la meilleure façon d'aborder ça. Il y a plusieurs angles possibles, mais je veux m'assurer de te donner quelque chose de vraiment utile.

Ton parcours est assez intéressant d'ailleurs. Laisse-moi voir comment ça s'articule avec ce que tu veux accomplir.

Je rassemble quelques idées. Je veux être sûr qu'elles soient adaptées à ta situation, pas juste des conseils génériques.

J'y suis presque. J'organise mes pensées pour que ce soit clair et actionnable.

Bon, je pense avoir une bonne perspective maintenant. Laisse-moi te préparer ça.`
        : `Hmm, let me take a moment to really understand what you're asking here...

Ok so looking at your profile and what you've shared with me, I'm starting to see some interesting patterns.

I'm thinking about the best way to approach this. There are a few angles I could take, but I want to make sure I give you something actually useful.

Your background is quite interesting actually. Let me consider how that plays into what you're trying to achieve.

I'm pulling together a few ideas here. Want to make sure they're tailored to your specific situation, not just generic advice.

Almost got it. Just organizing my thoughts so this makes sense and you can actually act on it.

Right, I think I've got a good perspective on this now. Let me put it together for you.`;

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
