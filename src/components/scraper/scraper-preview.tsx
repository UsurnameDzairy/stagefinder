"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  ChevronUp, 
  ChevronDown,
  Eye,
  EyeOff,
  Terminal
} from "lucide-react";

interface SourceStatus {
  name: string;
  status: "idle" | "scraping" | "done" | "error";
  jobsFound: number;
}

interface ScraperPreviewProps {
  isActive: boolean;
  searchQuery?: string;
  location?: string;
  jobId?: string;
}

export function ScraperPreview({ isActive, searchQuery, location, jobId }: ScraperPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<string>("");
  const [resultsCount, setResultsCount] = useState(0);
  const [sources, setSources] = useState<SourceStatus[]>([
    { name: "LinkedIn", status: "idle", jobsFound: 0 },
    { name: "Indeed", status: "idle", jobsFound: 0 },
    { name: "HelloWork", status: "idle", jobsFound: 0 },
    { name: "WTTJ", status: "idle", jobsFound: 0 },
  ]);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll le statut réel du job de recherche
  const pollJobStatus = useCallback(async () => {
    if (!jobId) return;
    
    try {
      const response = await fetch(`/api/search-jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        
        setProgress(data.progress || 0);
        setStep(data.step || "");
        setResultsCount(data.resultsCount || 0);
        
        // Mettre à jour le statut des sources basé sur le progress réel
        // L'API retourne déjà un objet parsé, pas besoin de JSON.parse
        const providerStatuses = data.providerStatuses || {};
        
        setSources(prev => prev.map(source => {
          const sourceKey = source.name.toLowerCase();
          const providerStatus = providerStatuses[sourceKey];
          
          if (providerStatus) {
            return {
              ...source,
              status: providerStatus.status === "done" ? "done" : 
                      providerStatus.status === "error" ? "error" :
                      providerStatus.status === "scraping" ? "scraping" : "idle",
              jobsFound: providerStatus.count || 0,
            };
          }
          
          // Estimation basée sur le progress
          if (data.progress >= 60) {
            return { ...source, status: "done", jobsFound: Math.floor(data.resultsCount / 4) };
          } else if (data.progress >= 30) {
            return { ...source, status: "scraping", jobsFound: 0 };
          }
          return source;
        }));
        
        // Stop polling si terminé
        if (data.status === "DONE" || data.status === "FAILED") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          
          // Marquer toutes les sources comme terminées
          setSources(prev => prev.map(s => ({
            ...s,
            status: data.status === "DONE" ? "done" : "error",
            jobsFound: Math.floor((data.resultsCount || 0) / 4),
          })));
        }
      }
    } catch (error) {
      console.error("Error polling job status:", error);
    }
  }, [jobId]);

  // Démarrer le polling quand actif
  useEffect(() => {
    if (isActive && jobId) {
      // Reset
      setProgress(0);
      setStep("");
      setResultsCount(0);
      setSources([
        { name: "LinkedIn", status: "scraping", jobsFound: 0 },
        { name: "Indeed", status: "scraping", jobsFound: 0 },
        { name: "HelloWork", status: "scraping", jobsFound: 0 },
        { name: "WTTJ", status: "scraping", jobsFound: 0 },
      ]);
      
      // Poll immédiatement puis toutes les 2 secondes
      pollJobStatus();
      pollIntervalRef.current = setInterval(pollJobStatus, 2000);
      
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    } else if (!isActive) {
      // Reset quand inactif
      setSources([
        { name: "LinkedIn", status: "idle", jobsFound: 0 },
        { name: "Indeed", status: "idle", jobsFound: 0 },
        { name: "HelloWork", status: "idle", jobsFound: 0 },
        { name: "WTTJ", status: "idle", jobsFound: 0 },
      ]);
      setProgress(0);
      setResultsCount(0);
    }
  }, [isActive, jobId, pollJobStatus]);

  if (!isActive && progress === 0) return null;

  if (!isVisible) {
    return (
      <div className="fixed bottom-20 right-4 z-[9998]">
        <Button
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
        >
          <Eye className="h-4 w-4 mr-2" />
          Voir Scraper
        </Button>
      </div>
    );
  }

  const getStepLabel = (step: string) => {
    switch (step) {
      case "RESUME_ANALYSIS": return "Analyse du CV...";
      case "PROVIDER_FETCH": return "Scraping en cours...";
      case "DEDUPLICATION": return "Dédoublonnage...";
      case "RECOMMENDATIONS": return "Calcul des recommandations...";
      default: return "Traitement...";
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9998] w-80 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-black/90 backdrop-blur-xl border-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-2xl relative">
        <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
          <Terminal className="h-24 w-24 text-white" />
        </div>

        <CardHeader className="py-3 px-4 border-b border-zinc-900 bg-zinc-950/50 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                <Terminal className="h-3.5 w-3.5 text-zinc-400" />
              </div>
              <CardTitle className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Scraper Engine</CardTitle>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 w-7 rounded-lg border border-zinc-900 bg-black text-zinc-600 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-all"
              >
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="h-7 w-7 rounded-lg border border-zinc-900 bg-black text-zinc-600 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-all"
              >
                <EyeOff className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-4 space-y-5 relative z-10">
            {/* Progress Bar Premium */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline px-0.5">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{getStepLabel(step)}</span>
                <span className="text-sm font-bold tracking-tighter text-white">{progress}%</span>
              </div>
              <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Sources Status monochrome */}
            <div className="grid grid-cols-1 gap-1.5">
              {sources.map((source) => (
                <div 
                  key={source.name}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300",
                    source.status === "scraping" ? "bg-zinc-950 border-zinc-800 animate-pulse" :
                    source.status === "done" ? "bg-zinc-950 border-zinc-900" :
                    source.status === "error" ? "bg-zinc-950 border-zinc-700" :
                    "bg-black border-zinc-900 opacity-40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      source.status === "done" ? "bg-white" : 
                      source.status === "scraping" ? "bg-zinc-400" : 
                      source.status === "error" ? "bg-zinc-700" :
                      "bg-zinc-800"
                    )} />
                    <span className={cn(
                      "text-[11px] font-bold tracking-tight",
                      source.status === "done" ? "text-zinc-100" : "text-zinc-500"
                    )}>
                      {source.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {source.status === "scraping" && (
                      <div className="flex gap-0.5">
                        <div className="w-0.5 h-0.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-0.5 h-0.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-0.5 h-0.5 bg-zinc-400 rounded-full animate-bounce" />
                      </div>
                    )}
                    {source.status === "done" && source.jobsFound > 0 && (
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                        {source.jobsFound} jobs
                      </span>
                    )}
                    {source.status === "error" && <XCircle className="h-3 w-3 text-zinc-600" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            {resultsCount > 0 && (
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-xl">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Extracted entities:</span>
                <span className="text-[11px] font-black text-white tracking-tighter">{resultsCount}</span>
              </div>
            )}

            {/* Terminal Info */}
            <div className="bg-[#050505] border border-zinc-900 rounded-xl p-3 font-mono text-[9px] space-y-1">
              <div className="flex items-center gap-1.5 opacity-40 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                <span className="uppercase tracking-widest">System Params</span>
              </div>
              <p className="text-zinc-600 truncate">QUERY: {searchQuery || "N/A"}</p>
              <p className="text-zinc-600 truncate">LOC: {location || "GLOBAL"}</p>
              <p className="text-zinc-400 pt-1 border-t border-zinc-900/50">
                <span className="text-white">{'>>'}</span> VERIFIED DATA STREAM
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
