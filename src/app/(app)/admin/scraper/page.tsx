"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { Building2, Search, TrendingUp, AlertCircle, CheckCircle, Play, Database } from "lucide-react";

export default function ScraperAdminPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [selectedSector, setSelectedSector] = useState<string>("all");

  const sectors = [
    { id: "all", name: "Toutes les entreprises", count: 45 },
    { id: "finance", name: "Finance", count: 15 },
    { id: "tech", name: "Tech", count: 5 },
    { id: "consulting", name: "Conseil", count: 5 },
  ];

  const handleScrape = async () => {
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector: selectedSector === "all" ? undefined : selectedSector }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Scraping error:", error);
      setResults({ success: false, error: "Failed to scrape companies" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-6xl pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-serif font-normal tracking-tight text-white flex items-center gap-3">
          <Database className="h-6 w-6 text-zinc-400" />
          Scraper Control Center
        </h1>
        <p className="text-[13px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
          Supervision technique et orchestration du scraping des flux d'opportunités.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {sectors.map((sector) => (
          <Card
            key={sector.id}
            className={cn(
              "cursor-pointer transition-all duration-300 bg-black border shadow-none relative overflow-hidden group",
              selectedSector === sector.id
                ? "border-white ring-1 ring-white/20"
                : "border-zinc-900 hover:border-zinc-700"
            )}
            onClick={() => setSelectedSector(sector.id)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">{sector.name}</p>
                <Building2 className={cn("h-3.5 w-3.5 transition-colors", selectedSector === sector.id ? "text-white" : "text-zinc-800 group-hover:text-zinc-600")} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tighter text-white">{sector.count}</span>
                <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Entities</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-black border-zinc-900 shadow-none overflow-hidden">
        <CardHeader className="p-6 border-b border-zinc-900/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Exécution du Scraper</CardTitle>
              <CardDescription className="text-[13px] text-zinc-600 font-medium">Récupération synchrone des offres et programmes stratégiques</CardDescription>
            </div>
            {selectedSector !== "all" && (
              <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                Target: {sectors.find((s) => s.id === selectedSector)?.name}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="flex flex-col items-center justify-center py-10 space-y-6">
            <div className={cn(
              "p-6 rounded-full border transition-all duration-700",
              loading ? "bg-white border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "bg-zinc-950 border-zinc-900"
            )}>
              <Play className={cn("h-10 w-10 transition-all", loading ? "text-black scale-90" : "text-zinc-800")} />
            </div>
            
            <Button
              onClick={handleScrape}
              disabled={loading}
              className="bg-black hover:bg-zinc-900 text-white h-12 px-12 font-bold text-[11px] uppercase tracking-[0.2em] border border-zinc-800 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader size="sm" />
                  <span>Traitement en cours...</span>
                </div>
              ) : (
                "Initialiser le processus"
              )}
            </Button>
          </div>

          {results && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {results.success ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      { label: "Secteurs traités", value: results.stats.companiesScraped, icon: CheckCircle },
                      { label: "Flux analysés", value: results.stats.totalJobsFound, icon: Search },
                      { label: "Entités stockées", value: results.stats.jobsSaved, icon: Database },
                    ].map((stat, i) => (
                      <div key={i} className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <stat.icon className="h-3.5 w-3.5 text-zinc-600" />
                          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                        </div>
                        <p className="text-3xl font-bold tracking-tighter text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-zinc-900 bg-black/40">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Log détaillé des entités</h4>
                    </div>
                    <div className="divide-y divide-zinc-900 max-h-[400px] overflow-y-auto scrollbar-hide">
                      {results.results.map((result: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-zinc-900/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              result.success ? "bg-zinc-400" : "bg-zinc-800"
                            )} />
                            <span className="text-[13px] font-bold text-zinc-300 tracking-tight">{result.company}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {result.success ? (
                              <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">{result.jobCount} opportunités</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-zinc-950 text-zinc-700 border border-zinc-900">Failure</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center gap-4">
                  <AlertCircle className="h-5 w-5 text-zinc-700" />
                  <div className="space-y-1">
                    <p className="text-[13px] font-bold text-zinc-500 uppercase tracking-widest">System Error</p>
                    <p className="text-[12px] font-medium text-zinc-700">{results.error || "Une erreur critique est survenue lors du traitement."}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-black border-zinc-900 shadow-none">
        <CardHeader className="p-6">
          <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Scope de Surveillance</CardTitle>
          <CardDescription className="text-[13px] text-zinc-600 font-medium">Structure du périmètre d'analyse automatique</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-8">
          {[
            { title: "Finance Intelligence", companies: ["Goldman Sachs", "JP Morgan", "Morgan Stanley", "BNP Paribas", "Société Générale", "Crédit Agricole", "Rothschild & Co", "Lazard", "Barclays", "HSBC", "Citi", "Deutsche Bank", "UBS", "Credit Suisse", "Natixis"] },
            { title: "Big Tech Ecosystem", companies: ["Google", "Meta", "Microsoft", "Amazon", "Apple"] },
            { title: "Strategic Consulting", companies: ["McKinsey & Company", "Boston Consulting Group", "Bain & Company", "Deloitte", "PwC"] },
          ].map((scope, i) => (
            <div key={i} className="space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-900" />
                {scope.title}
                <div className="h-px flex-1 bg-zinc-900" />
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {scope.companies.map((company) => (
                  <span key={company} className="px-3 py-1.5 rounded-lg border border-zinc-900 bg-zinc-950/50 text-[11px] font-bold text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all cursor-default">
                    {company}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
