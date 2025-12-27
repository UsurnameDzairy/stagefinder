"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { Building2, Briefcase, TrendingUp, AlertCircle, CheckCircle, Play, Database } from "lucide-react";

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
    <div className="space-y-6 max-w-6xl pb-24">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Scraper Admin</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Gérez le scraping des offres des grandes entreprises
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {sectors.map((sector) => (
          <Card
            key={sector.id}
            className={`cursor-pointer transition-all ${
              selectedSector === sector.id
                ? "ring-2 ring-zinc-500 bg-zinc-800"
                : "hover:bg-zinc-800"
            }`}
            onClick={() => setSelectedSector(sector.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-300">{sector.name}</p>
                  <p className="text-2xl font-bold text-zinc-50 mt-1">{sector.count}</p>
                </div>
                <Building2 className="h-8 w-8 text-zinc-500" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lancer le scraping</CardTitle>
          <CardDescription>
            Récupérer les dernières offres de stages et programmes des grandes entreprises
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleScrape}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Scraping en cours...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Démarrer le scraping
                </>
              )}
            </Button>
            {selectedSector !== "all" && (
              <Badge variant="secondary">
                Secteur: {sectors.find((s) => s.id === selectedSector)?.name}
              </Badge>
            )}
          </div>

          {results && (
            <div className="mt-6 space-y-4">
              {results.success ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-zinc-800 border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/10 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <p className="text-xs text-zinc-400">Entreprises scrapées</p>
                            <p className="text-2xl font-bold text-zinc-50">
                              {results.stats.companiesScraped}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-zinc-800 border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Briefcase className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-zinc-400">Offres trouvées</p>
                            <p className="text-2xl font-bold text-zinc-50">
                              {results.stats.totalJobsFound}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-zinc-800 border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Database className="h-5 w-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-xs text-zinc-400">Nouvelles offres</p>
                            <p className="text-2xl font-bold text-zinc-50">
                              {results.stats.jobsSaved}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader>
                      <CardTitle className="text-sm">Détails par entreprise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {results.results.map((result: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {result.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-sm font-medium text-zinc-200">
                                {result.company}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {result.success ? (
                                <Badge variant="secondary">
                                  {result.jobCount} offres
                                </Badge>
                              ) : (
                                <Badge variant="destructive">Erreur</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-red-400">
                          Erreur lors du scraping
                        </p>
                        <p className="text-xs text-red-300 mt-1">
                          {results.error || "Une erreur est survenue"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entreprises ciblées</CardTitle>
          <CardDescription>
            Liste des grandes entreprises financières et leurs programmes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-2">Finance (15)</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Goldman Sachs",
                  "JP Morgan",
                  "Morgan Stanley",
                  "BNP Paribas",
                  "Société Générale",
                  "Crédit Agricole",
                  "Rothschild & Co",
                  "Lazard",
                  "Barclays",
                  "HSBC",
                  "Citi",
                  "Deutsche Bank",
                  "UBS",
                  "Credit Suisse",
                  "Natixis",
                ].map((company) => (
                  <Badge key={company} variant="secondary">
                    {company}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-2">Tech (5)</h3>
              <div className="flex flex-wrap gap-2">
                {["Google", "Meta", "Microsoft", "Amazon", "Apple"].map((company) => (
                  <Badge key={company} variant="secondary">
                    {company}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-2">Conseil (5)</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "McKinsey & Company",
                  "Boston Consulting Group",
                  "Bain & Company",
                  "Deloitte",
                  "PwC",
                ].map((company) => (
                  <Badge key={company} variant="secondary">
                    {company}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
