"use client";

import { CheckCircle2, Circle, Clock, Mail, MessageSquare, Calendar, Award, XCircle } from "lucide-react";

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
        icon: <CheckCircle2 className="h-5 w-5" />,
        status: "completed",
      },
      {
        id: "email_sent",
        label: "Email envoyé",
        icon: <Mail className="h-5 w-5" />,
        status: emailSent ? "completed" : "pending",
        date: formatDate(emailSentAt),
      },
      {
        id: "response",
        label: "Réponse",
        icon: <MessageSquare className="h-5 w-5" />,
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
        icon: <Calendar className="h-5 w-5" />,
        status: interviewAt ? "completed" : "current",
        date: formatDate(interviewAt),
      });
    }

    // Ajouter l'étape finale selon le statut
    if (applicationStatus === "OFFER") {
      stages.push({
        id: "offer",
        label: "Offre reçue",
        icon: <Award className="h-5 w-5" />,
        status: "completed",
      });
    } else if (applicationStatus === "REJECTED") {
      stages.push({
        id: "rejected",
        label: "Refusé",
        icon: <XCircle className="h-5 w-5" />,
        status: "failed",
      });
    }

    return stages;
  };

  const stages = getStages();

  return (
    <div className="relative pt-2">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex flex-col items-center relative flex-1">
            {/* Ligne de connexion premium */}
            {index < stages.length - 1 && (
              <div
                className={cn(
                  "absolute top-[18px] left-[50%] w-full h-[1px] transition-all duration-500",
                  stage.status === "completed"
                    ? "bg-white"
                    : "bg-zinc-900"
                )}
              />
            )}
            
            {/* Icône du stage épurée */}
            <div
              className={cn(
                "relative z-10 p-2 rounded-xl border transition-all duration-500",
                stage.status === "completed"
                  ? "bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  : stage.status === "current"
                  ? "bg-black border-white text-white animate-pulse"
                  : stage.status === "failed"
                  ? "bg-zinc-950 border-zinc-700 text-zinc-400"
                  : "bg-black border-zinc-900 text-zinc-700"
              )}
            >
              {stage.status === "current" ? (
                <Clock className="h-4 w-4" />
              ) : (
                <div className="scale-90 opacity-90">{stage.icon}</div>
              )}
            </div>
            
            {/* Label raffiné */}
            <span
              className={cn(
                "mt-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-500",
                stage.status === "completed"
                  ? "text-zinc-300"
                  : stage.status === "current"
                  ? "text-white"
                  : stage.status === "failed"
                  ? "text-zinc-500"
                  : "text-zinc-700"
              )}
            >
              {stage.label}
            </span>
            
            {/* Date subtile */}
            {stage.date && (
              <span className="text-[9px] font-medium text-zinc-600 mt-0.5 tracking-wider">{stage.date}</span>
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

