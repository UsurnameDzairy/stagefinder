"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import {
  Search,
  Brain,
  Layers,
  BarChart3,
  Lightbulb,
  Check,
  X,
  Clock,
} from "lucide-react";

interface SearchJobStatus {
  id: string;
  status: "QUEUED" | "RUNNING" | "DONE" | "FAILED" | "CANCELED";
  progress: number;
  step: string;
  providerStatuses: Record<string, { status: string; count?: number }>;
  resultsCount?: number;
  error?: string;
}

interface SearchCompilationModalProps {
  jobId: string;
  onComplete: (results: any[]) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: "RESUME_ANALYSIS", label: "Analyse du CV et normalisation", icon: Brain },
  { id: "PROVIDER_FETCH", label: "Interrogation des sources", icon: Search },
  { id: "DEDUPLICATION", label: "Deduplication des offres", icon: Layers },
  { id: "SCORING", label: "Calcul du score de compatibilite", icon: BarChart3 },
  { id: "RECOMMENDATIONS", label: "Recommandations metiers", icon: Lightbulb },
];

const MESSAGES = [
  "On associe vos competences aux exigences des offres...",
  "On elimine les doublons entre sources...",
  "On calcule votre score de compatibilite...",
  "On analyse les tendances du marche...",
  "On prepare vos recommandations personnalisees...",
];

export function SearchCompilationModal({
  jobId,
  onComplete,
  onCancel,
}: SearchCompilationModalProps) {
  const [status, setStatus] = useState<SearchJobStatus | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/search-jobs/${jobId}`);
      const data = await res.json();
      setStatus(data);

      if (data.status === "DONE") {
        const resultsRes = await fetch(`/api/search-jobs/${jobId}/results`);
        const results = await resultsRes.json();
        onComplete(results.offers || []);
      } else if (data.status === "FAILED" || data.status === "CANCELED") {
        onCancel();
      }
    } catch (error) {
      console.error("Poll error:", error);
    }
  }, [jobId, onComplete, onCancel]);

  useEffect(() => {
    const interval = setInterval(pollStatus, 1000);
    return () => clearInterval(interval);
  }, [pollStatus]);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async () => {
    try {
      await fetch(`/api/search-jobs/${jobId}/cancel`, { method: "POST" });
    } catch (error) {
      console.error("Cancel error:", error);
    }
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === status?.step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Compilation des offres en cours</CardTitle>
          <p className="text-sm text-zinc-500">
            Analyse du profil + collecte multi-sources + scoring
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-zinc-400" />
              <span className="font-mono text-lg">{formatTime(elapsed)}</span>
            </div>
            <span className="text-sm text-zinc-500">Duree estimee: 2-3 minutes</span>
          </div>

          <div className="space-y-3">
            {STEPS.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-zinc-100"
                      : isCompleted
                      ? "bg-zinc-50"
                      : "bg-transparent"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isCompleted
                        ? "bg-zinc-900 text-white"
                        : isActive
                        ? "bg-zinc-200"
                        : "bg-zinc-100"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : isActive ? (
                      <Loader size="sm" />
                    ) : (
                      <Icon className="h-4 w-4 text-zinc-400" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      isActive || isCompleted ? "text-zinc-900" : "text-zinc-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {status?.providerStatuses && Object.keys(status.providerStatuses).length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <p className="text-xs font-medium text-zinc-500 uppercase">Sources</p>
              <div className="space-y-1">
                {Object.entries(status.providerStatuses).map(([provider, data]) => (
                  <div key={provider} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600">{provider}</span>
                    <span
                      className={`flex items-center gap-1 ${
                        data.status === "done"
                          ? "text-green-600"
                          : data.status === "running"
                          ? "text-amber-600"
                          : data.status === "failed"
                          ? "text-red-600"
                          : "text-zinc-400"
                      }`}
                    >
                      {data.status === "done" && <Check className="h-3 w-3" />}
                      {data.status === "running" && <Loader size="sm" />}
                      {data.status === "failed" && <X className="h-3 w-3" />}
                      {data.status}
                      {data.count !== undefined && ` (${data.count})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-zinc-500 text-center italic">
              {MESSAGES[messageIndex]}
            </p>
          </div>

          <div className="pt-2 text-center">
            <p className="text-xs text-zinc-400">
              StageFinder compile les resultats sans vous rediriger vers des sites
              externes, pour une experience professionnelle et centralisee.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
