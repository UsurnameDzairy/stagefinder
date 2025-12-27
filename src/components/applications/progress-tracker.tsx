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
    <div className="relative">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex flex-col items-center relative flex-1">
            {/* Ligne de connexion */}
            {index < stages.length - 1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-0.5 ${
                  stage.status === "completed"
                    ? "bg-green-500"
                    : stage.status === "failed"
                    ? "bg-red-500"
                    : "bg-zinc-700"
                }`}
                style={{ transform: "translateX(50%)" }}
              />
            )}
            
            {/* Icône du stage */}
            <div
              className={`relative z-10 p-2 rounded-full ${
                stage.status === "completed"
                  ? "bg-green-500 text-white"
                  : stage.status === "current"
                  ? "bg-blue-500 text-white animate-pulse"
                  : stage.status === "failed"
                  ? "bg-red-500 text-white"
                  : "bg-zinc-700 text-zinc-400"
              }`}
            >
              {stage.status === "current" ? (
                <Clock className="h-5 w-5" />
              ) : (
                stage.icon
              )}
            </div>
            
            {/* Label */}
            <span
              className={`mt-2 text-xs font-medium ${
                stage.status === "completed"
                  ? "text-green-400"
                  : stage.status === "current"
                  ? "text-blue-400"
                  : stage.status === "failed"
                  ? "text-red-400"
                  : "text-zinc-500"
              }`}
            >
              {stage.label}
            </span>
            
            {/* Date */}
            {stage.date && (
              <span className="text-[10px] text-zinc-500">{stage.date}</span>
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
      <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div className="h-full bg-red-500 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-500 ${
          progress === 100 ? "bg-green-500" : "bg-blue-500"
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
