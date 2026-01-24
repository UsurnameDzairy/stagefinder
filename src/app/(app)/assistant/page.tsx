"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { Bot, Send, User, Sparkles, TrendingUp, Target, Lightbulb } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "Analyse mon profil",
  "Quelles entreprises me recommandes-tu ?",
  "Quels postes correspondent à mon profil ?",
  "Comment améliorer mes compétences ?",
  "Quelle stratégie de recherche adopter ?",
];

export default function AssistantPage() {
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Charger le contexte utilisateur
    fetch("/api/assistant")
      .then((res) => res.json())
      .then((data) => setContext(data.context))
      .catch(console.error);

    // Message de bienvenue
    setMessages([
      {
        role: "assistant",
        content: `Bonjour ! 👋 Je suis votre assistant carrière personnalisé.

Je peux vous aider à :
📊 Analyser votre profil et identifier vos forces
🏢 Recommander les meilleures entreprises pour vous
💼 Suggérer des postes adaptés à votre profil
🎯 Développer vos compétences stratégiques
📈 Optimiser votre stratégie de recherche

Que souhaitez-vous savoir ?`,
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
    } catch (error) {
      console.error("Assistant error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, une erreur est survenue. Veuillez réessayer.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
  };

  return (
    <div className="h-[calc(100vh-4rem)] max-w-5xl mx-auto flex flex-col space-y-6 pb-6">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-4xl font-serif font-normal tracking-tight text-white flex items-center gap-3">
          <Bot className="h-6 w-6 text-zinc-400" />
          {t("assistant.title")}
        </h1>
        <p className="text-[13px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-1">
          {t("assistant.subtitle")}
        </p>
      </div>

      {context && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Profil", value: context.hasProfile ? "Optimal" : "Incomplet", icon: User, color: "text-zinc-100" },
            { label: "Compétences", value: context.skillsCount, icon: Target, color: "text-zinc-300" },
            { label: "Candidatures", value: context.applicationsCount, icon: TrendingUp, color: "text-zinc-400" },
            { label: "Sauvegardes", value: context.savedOffersCount, icon: Sparkles, color: "text-white" },
          ].map((item, i) => (
            <Card key={i} className="bg-black border-zinc-900 shadow-none hover:border-zinc-800 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg">
                  <item.icon className="h-3.5 w-3.5 text-zinc-600" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{item.label}</p>
                  <p className={cn("text-sm font-bold tracking-tight", item.color)}>{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="flex-1 flex flex-col bg-black border-zinc-900 shadow-none overflow-hidden rounded-2xl relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
          <Bot className="h-64 w-64 text-white" />
        </div>
        
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative z-10">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border transition-all shadow-sm",
                message.role === "assistant" 
                  ? "bg-white border-white text-black" 
                  : "bg-zinc-950 border-zinc-900 text-zinc-400"
              )}>
                {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl p-4 text-[14px] leading-relaxed font-medium shadow-sm",
                  message.role === "user"
                    ? "bg-zinc-900 text-zinc-100 border border-zinc-800"
                    : "bg-zinc-950 text-zinc-300 border border-zinc-900"
                )}
              >
                <div className="whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 justify-start animate-pulse">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white flex items-center justify-center text-black">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl px-6 py-4 flex items-center">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-6 bg-black border-t border-zinc-900 space-y-4">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 animate-in fade-in duration-700">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => handleQuickQuestion(question)}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-full border border-zinc-800 bg-zinc-950/50 text-[11px] font-serif italic text-white hover:text-white hover:border-zinc-600 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Décrivez votre objectif de carrière..."
                disabled={loading}
                className="h-12 bg-zinc-950 border-zinc-900 focus:border-white transition-all text-sm rounded-2xl pl-5 pr-12 scrollbar-hide"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest hidden sm:block">Press Enter</span>
              </div>
            </div>
            <Button 
              onClick={() => handleSend()} 
              disabled={loading || !input.trim()}
              className="bg-black hover:bg-zinc-900 text-white h-12 w-12 rounded-full border border-zinc-800 transition-all p-0 shadow-lg flex items-center justify-center hover:scale-[1.05] active:scale-[0.95]"
            >
              {loading ? (
                <Loader size="sm" />
              ) : (
                <Send className="h-4 w-4 text-zinc-400" />
              )}
            </Button>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">
              Propulsé par StageFinder Intelligence • Données sécurisées
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
