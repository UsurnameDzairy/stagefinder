"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { Bot, Send, User, Sparkles, TrendingUp, Target, Lightbulb } from "lucide-react";

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
    <div className="h-[calc(100vh-4rem)] max-w-5xl mx-auto flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-zinc-50">Assistant Carrière IA</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Conseils personnalisés basés sur votre profil
        </p>
      </div>

      {context && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 rounded">
                  <User className="h-3 w-3 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Profil</p>
                  <p className="text-sm font-semibold text-zinc-100">
                    {context.hasProfile ? "Complet" : "À compléter"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-500/10 rounded">
                  <Target className="h-3 w-3 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Compétences</p>
                  <p className="text-sm font-semibold text-zinc-100">
                    {context.skillsCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/10 rounded">
                  <TrendingUp className="h-3 w-3 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Candidatures</p>
                  <p className="text-sm font-semibold text-zinc-100">
                    {context.applicationsCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 rounded">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Offres sauvées</p>
                  <p className="text-sm font-semibold text-zinc-100">
                    {context.savedOffersCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="flex-1 flex flex-col bg-zinc-900 border-zinc-800">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-zinc-100 text-zinc-900"
                    : "bg-zinc-800 text-zinc-100"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                  <User className="h-4 w-4 text-zinc-300" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <Loader size="sm" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t border-zinc-800 p-4 space-y-3">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((question) => (
                <Button
                  key={question}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickQuestion(question)}
                  disabled={loading}
                  className="text-xs"
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  {question}
                </Button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Posez votre question..."
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={() => handleSend()} disabled={loading || !input.trim()}>
              {loading ? (
                <Loader size="sm" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
