"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Bot, X, Send, Minimize2, Maximize2, RotateCcw, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PAGE_CONTEXTS: Record<string, string> = {
  "/dashboard": "Tu es sur le Dashboard. L'utilisateur voit ses statistiques et activités récentes.",
  "/offres": "Tu es sur la page Offres. L'utilisateur recherche des stages et emplois.",
  "/entreprises": "Tu es sur la page Entreprises. L'utilisateur explore les entreprises.",
  "/candidatures": "Tu es sur la page Candidatures. L'utilisateur gère ses candidatures.",
  "/lettres": "Tu es sur la page Lettres de motivation. L'utilisateur génère des lettres.",
  "/parametres": "Tu es sur la page Paramètres. L'utilisateur modifie son profil et préférences.",
  "/assistant": "Tu es sur la page Assistant IA principale.",
};

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      const pageContext = PAGE_CONTEXTS[pathname] || "";
      const greeting = `👋 Bonjour ! Je suis votre assistant IA.${pageContext ? `\n\n${pageContext}` : ""}\n\nComment puis-je vous aider ?`;
      
      setMessages([
        {
          role: "assistant",
          content: greeting,
        },
      ]);
    }
  }, [isOpen, pathname]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const pageContext = PAGE_CONTEXTS[pathname] || "";
    const contextualInput = pageContext 
      ? `[Contexte: ${pageContext}] ${input}`
      : input;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: contextualInput }],
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

  const handleMorphSubmit = async (message: string) => {
    const userMessage: Message = { role: "user", content: message };
    const pageContext = PAGE_CONTEXTS[pathname] || "";
    const contextualInput = pageContext 
      ? `[Contexte: ${pageContext}] ${message}`
      : message;

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setIsOpen(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: contextualInput }],
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-2xl bg-white text-black shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group border-none"
        >
          <Bot className="h-6 w-6 transition-transform group-hover:rotate-12" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-zinc-900 rounded-full border-2 border-white animate-pulse" />
        </button>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-4">
        <Card className="bg-black border-zinc-900 shadow-2xl overflow-hidden">
          <CardContent className="p-3 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-black">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-[120px]">
              <p className="text-[11px] font-bold text-zinc-100 uppercase tracking-widest">Assistant IA</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1 h-1 bg-zinc-400 rounded-full animate-pulse" />
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Awaiting...</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(false)}
                className="h-8 w-8 rounded-lg border border-zinc-900 bg-black text-zinc-500 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-all"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-lg border border-zinc-900 bg-black text-zinc-500 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-[400px] h-[600px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="flex-1 flex flex-col bg-black border-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-3xl relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
          <Bot className="h-48 w-48 text-white" />
        </div>

        {/* Header Premium */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-950/50 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-black shadow-xl">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Career Intelligence</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Engine</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setMessages([]);
                const pageContext = PAGE_CONTEXTS[pathname] || "";
                const greeting = `👋 Bonjour ! Je suis votre assistant IA.${pageContext ? `\n\n${pageContext}` : ""}\n\nComment puis-je vous aider ?`;
                setMessages([{ role: "assistant", content: greeting }]);
              }}
              className="h-8 w-8 rounded-lg border border-zinc-900 bg-black text-zinc-600 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-all"
              title="Reset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="h-8 w-8 rounded-lg border border-zinc-900 bg-black text-zinc-600 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-all"
              title="Minimize"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-lg border border-zinc-900 bg-black text-zinc-600 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-all"
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Messages List épurée */}
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative z-10">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                message.role === "assistant" 
                  ? "bg-white border-white text-black shadow-md" 
                  : "bg-zinc-950 border-zinc-900 text-zinc-500"
              )}>
                {message.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              </div>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl p-4 text-[13px] leading-relaxed font-medium",
                  message.role === "user"
                    ? "bg-zinc-900 text-zinc-100 border border-zinc-800"
                    : "bg-zinc-950 text-zinc-300 border border-zinc-900 shadow-sm"
                )}
              >
                <div className="whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start animate-pulse">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl px-5 py-3 flex items-center">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Premium */}
        <div className="p-6 bg-black border-t border-zinc-900">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask intelligence..."
                disabled={loading}
                className="h-11 bg-zinc-950 border-zinc-900 focus:border-white transition-all text-[13px] rounded-xl pl-4 pr-10"
              />
            </div>
            <button 
              onClick={handleSend} 
              disabled={loading || !input.trim()}
              className="h-11 w-11 rounded-xl bg-white text-black flex items-center justify-center transition-all hover:bg-zinc-200 disabled:opacity-20 active:scale-95 shadow-xl border-none"
            >
              {loading ? <Loader size="sm" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-[0.3em] text-center mt-4">
            Encrypted Session • Neural Engine Active
          </p>
        </div>
      </Card>
    </div>
  );
}
