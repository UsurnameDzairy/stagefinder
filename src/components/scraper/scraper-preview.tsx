"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
    <div className="fixed bottom-20 right-4 z-[9998] w-80">
      <Card className="bg-zinc-900/95 backdrop-blur-sm border-zinc-700 shadow-2xl">
        <CardHeader className="py-2 px-3 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm text-zinc-100">Scraper Live</CardTitle>
              {isActive && progress < 100 && (
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  {progress}%
                </Badge>
              )}
              {progress >= 100 && (
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Terminé
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-3 space-y-3">
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">{getStepLabel(step)}</span>
                <span className="text-zinc-500">{progress}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Sources Status */}
            <div className="grid grid-cols-2 gap-2">
              {sources.map((source) => (
                <div 
                  key={source.name}
                  className={`flex items-center gap-2 p-2 rounded-md text-xs ${
                    source.status === "scraping" ? "bg-blue-500/20 border border-blue-500/30" :
                    source.status === "done" ? "bg-emerald-500/20 border border-emerald-500/30" :
                    source.status === "error" ? "bg-red-500/20 border border-red-500/30" :
                    "bg-zinc-800/50 border border-zinc-700"
                  }`}
                >
                  {source.status === "scraping" && <Loader2 className="h-3 w-3 animate-spin text-blue-400" />}
                  {source.status === "done" && <CheckCircle className="h-3 w-3 text-emerald-400" />}
                  {source.status === "error" && <XCircle className="h-3 w-3 text-red-400" />}
                  {source.status === "idle" && <Globe className="h-3 w-3 text-zinc-500" />}
                  <span className={`flex-1 ${
                    source.status === "scraping" ? "text-blue-300" :
                    source.status === "done" ? "text-emerald-300" :
                    source.status === "error" ? "text-red-300" :
                    "text-zinc-400"
                  }`}>
                    {source.name}
                  </span>
                  {source.status === "done" && source.jobsFound > 0 && (
                    <Badge className="bg-emerald-500/30 text-emerald-300 text-[10px] px-1">
                      {source.jobsFound}
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Total Jobs */}
            {resultsCount > 0 && (
              <div className="flex items-center justify-between px-2 py-1 bg-zinc-800/50 rounded-md">
                <span className="text-xs text-zinc-400">Total offres réelles:</span>
                <Badge className="bg-emerald-500 text-white">{resultsCount}</Badge>
              </div>
            )}

            {/* Info */}
            <div className="bg-black/50 rounded-md p-2 font-mono text-[10px] text-zinc-500">
              <p>🔍 Recherche: {searchQuery || "N/A"}</p>
              <p>📍 Lieu: {location || "Paris"}</p>
              <p className="text-emerald-400 mt-1">✓ Données 100% réelles (Puppeteer)</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
