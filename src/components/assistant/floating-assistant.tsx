"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { MorphPanel } from "@/components/ui/morph-panel";
import { Bot, X, Send, Minimize2, Maximize2 } from "lucide-react";

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
      <div className="fixed bottom-4 right-4 z-[9999]">
        <MorphPanel onSubmit={handleMorphSubmit} />
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-100">Assistant IA</p>
              <p className="text-xs text-zinc-400">En ligne</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsMinimized(false)}
              className="h-8 w-8"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-96 h-[600px] flex flex-col">
      <Card className="flex-1 flex flex-col bg-zinc-900 border-zinc-800 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">Assistant IA</p>
              <p className="text-xs text-zinc-400">En ligne</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsMinimized(true)}
              className="h-8 w-8"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-2 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-zinc-100 text-zinc-900"
                    : "bg-zinc-800 text-zinc-100"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-zinc-800 rounded-lg p-3">
                <Loader size="sm" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t border-zinc-800 p-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Posez votre question..."
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon">
              {loading ? <Loader size="sm" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
