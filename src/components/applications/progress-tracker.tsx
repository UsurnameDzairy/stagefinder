"use client";

import { Check, Send, MessageCircle, Video, Trophy, X, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStage {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: "completed" | "current" | "pending" | "failed";
  date?: string;
}

interface ProgressTrackerProps {
  applicationStatus: string;
  emailSent: boolean;
  emailSentAt?: string | null;
  responseReceived: boolean;
  responseReceivedAt?: string | null;
  responseType?: string | null;
  interviewAt?: string | null;
}

export function ProgressTracker({
  applicationStatus,
  emailSent,
  emailSentAt,
  responseReceived,
  responseReceivedAt,
  responseType,
  interviewAt,
}: ProgressTrackerProps) {
  const formatDate = (date: string | null | undefined) => {
    if (!date) return undefined;
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const getStages = (): ProgressStage[] => {
    const stages: ProgressStage[] = [
      {
        id: "applied",
        label: "Candidature",
        icon: <Check className="h-4 w-4" strokeWidth={3} />,
        status: "completed",
      },
      {
        id: "email_sent",
        label: "Email envoyé",
        icon: <Send className="h-4 w-4" strokeWidth={2.5} />,
        status: emailSent ? "completed" : "pending",
        date: formatDate(emailSentAt),
      },
      {
        id: "response",
        label: "Réponse",
        icon: <MessageCircle className="h-4 w-4" strokeWidth={2.5} />,
        status: responseReceived 
          ? (responseType === "negative" ? "failed" : "completed")
          : (emailSent ? "current" : "pending"),
        date: formatDate(responseReceivedAt),
      },
    ];

    // Ajouter l'étape entretien si applicable
    if (applicationStatus === "INTERVIEW" || interviewAt || responseType === "interview") {
      stages.push({
        id: "interview",
        label: "Entretien",
        icon: <Video className="h-4 w-4" strokeWidth={2.5} />,
        status: interviewAt ? "completed" : "current",
        date: formatDate(interviewAt),
      });
    }

    // Ajouter l'étape finale selon le statut
    if (applicationStatus === "OFFER") {
      stages.push({
        id: "offer",
        label: "Offre reçue",
        icon: <Trophy className="h-4 w-4" strokeWidth={2.5} />,
        status: "completed",
      });
    } else if (applicationStatus === "REJECTED") {
      stages.push({
        id: "rejected",
        label: "Refusé",
        icon: <X className="h-4 w-4" strokeWidth={3} />,
        status: "failed",
      });
    }

    return stages;
  };

  const stages = getStages();

  return (
    <div className="relative py-4">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex flex-col items-center relative flex-1">
            {/* Ligne de connexion */}
            {index < stages.length - 1 && (
              <div
                className={cn(
                  "absolute top-[22px] left-[50%] w-full h-[2px] transition-all duration-500",
                  stage.status === "completed"
                    ? "bg-gradient-to-r from-white to-zinc-600"
                    : "bg-zinc-800"
                )}
              />
            )}
            
            {/* Icône du stage */}
            <div
              className={cn(
                "relative z-10 w-11 h-11 flex items-center justify-center rounded-full border-2 transition-all duration-500",
                stage.status === "completed"
                  ? "bg-white border-white text-black shadow-[0_0_20px_rgba(255,255,255,0.25)]"
                  : stage.status === "current"
                  ? "bg-zinc-900 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : stage.status === "failed"
                  ? "bg-zinc-900 border-zinc-700 text-zinc-500"
                  : "bg-zinc-950 border-zinc-800 text-zinc-600"
              )}
            >
              {stage.status === "current" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : stage.status === "completed" ? (
                <div className="flex items-center justify-center">
                  {stage.icon}
                </div>
              ) : (
                <div className="opacity-60">{stage.icon}</div>
              )}
            </div>
            
            {/* Label */}
            <span
              className={cn(
                "mt-3 text-[10px] font-semibold uppercase tracking-widest transition-colors duration-500",
                stage.status === "completed"
                  ? "text-white"
                  : stage.status === "current"
                  ? "text-zinc-300"
                  : stage.status === "failed"
                  ? "text-zinc-600"
                  : "text-zinc-700"
              )}
            >
              {stage.label}
            </span>
            
            {/* Date */}
            {stage.date && (
              <span className="text-[9px] font-medium text-zinc-500 mt-1">{stage.date}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MiniProgressTracker({
  applicationStatus,
  emailSent,
  responseReceived,
  responseType,
}: {
  applicationStatus: string;
  emailSent: boolean;
  responseReceived: boolean;
  responseType?: string | null;
}) {
  const getProgress = () => {
    if (applicationStatus === "OFFER") return 100;
    if (applicationStatus === "REJECTED") return -1;
    if (applicationStatus === "INTERVIEW") return 75;
    if (responseReceived) return responseType === "negative" ? -1 : 60;
    if (emailSent) return 40;
    return 20;
  };

  const progress = getProgress();

  if (progress === -1) {
    return (
      <div className="w-full h-[2px] bg-zinc-900 rounded-full overflow-hidden">
        <div className="h-full bg-zinc-700 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-[2px] bg-zinc-950 rounded-full overflow-hidden border-zinc-900/30">
      <div
        className={cn(
          "h-full transition-all duration-700 ease-in-out",
          progress === 100 ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.3)]" : "bg-zinc-600"
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

