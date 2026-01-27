"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, X, Database, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

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

const SOURCES = [
  { id: "linkedin", name: "LinkedIn", color: "bg-zinc-100" },
  { id: "indeed", name: "Indeed", color: "bg-zinc-400" },
  { id: "hellowork", name: "HelloWork", color: "bg-zinc-600" },
  { id: "wttj", name: "WTTJ", color: "bg-zinc-800" },
];

export function SearchCompilationModal({
  jobId,
  onComplete,
  onCancel,
}: SearchCompilationModalProps) {
  const [status, setStatus] = useState<SearchJobStatus | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/search-jobs/${jobId}`);
      
      if (!res.ok) {
        console.error("Poll failed:", res.status);
        return;
      }
      
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
    pollStatus();
    const interval = setInterval(pollStatus, 1500);
    return () => clearInterval(interval);
  }, [pollStatus]);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
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

  const progress = status?.progress || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-[440px] mx-4 bg-black border-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-3xl relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
          <Database className="h-48 w-48 text-white" />
        </div>

        {/* Header Premium */}
        <div className="p-8 border-b border-zinc-900 bg-zinc-950/50 relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-black shadow-xl">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Search Engine active</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Multi-Source Sync</p>
              </div>
            </div>
          </div>
          <p className="text-[13px] font-medium text-zinc-600 ml-14">
            Scraping des offres stratégiques sur {SOURCES.length} plateformes majeures.
          </p>
        </div>

        {/* Progress Premium */}
        <div className="p-8 space-y-10 relative z-10">
          {/* Progress bar épurée */}
          <div className="space-y-4">
            <div className="flex justify-between items-baseline px-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Progress</span>
              <span className="text-2xl font-bold tracking-tighter text-white">{progress}%</span>
            </div>
            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Sources monochrome */}
          <div className="grid grid-cols-1 gap-2.5">
            {SOURCES.map((source) => {
              const sourceStatus = status?.providerStatuses?.[source.id];
              const isDone = sourceStatus?.status === "done";
              const isRunning = sourceStatus?.status === "running";
              const isFailed = sourceStatus?.status === "failed";
              const count = sourceStatus?.count;

              return (
                <div 
                  key={source.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                    isDone ? "bg-zinc-950 border-zinc-800" : 
                    isRunning ? "bg-zinc-950 border-zinc-900 animate-pulse" : 
                    "bg-black border-zinc-900 opacity-40"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      isDone ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" : 
                      isRunning ? "bg-zinc-400" : 
                      "bg-zinc-800"
                    )} />
                    <span className={cn(
                      "text-[13px] font-bold tracking-tight",
                      isDone ? "text-zinc-100" : "text-zinc-500"
                    )}>{source.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {isDone && (
                      <>
                        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">{count} jobs</span>
                        <Check className="h-3.5 w-3.5 text-zinc-400" />
                      </>
                    )}
                    {isRunning && (
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
                      </div>
                    )}
                    {isFailed && <X className="h-3.5 w-3.5 text-zinc-600" />}
                    {!sourceStatus && (
                      <span className="text-[9px] font-bold text-zinc-800 uppercase tracking-[0.2em]">Queued</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Premium */}
          <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">Elapsed Time</span>
              <span className="text-[13px] font-bold text-zinc-400 tracking-tight">
                {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}s
              </span>
            </div>
            <button 
              onClick={handleCancel}
              className="h-10 px-6 rounded-xl border border-zinc-900 bg-black text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:border-zinc-700 transition-all"
            >
              Abort Mission
            </button>
          </div>
        </div>
        <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-[0.3em] text-center pb-6">
          KamForJob Neural Core • Real-time Data Stream
        </p>
      </Card>
    </div>
  );
}
