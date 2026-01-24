"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ExternalLink, FileText, Send, Star, Trash2, MapPin } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { useTranslation } from "@/lib/i18n";

interface SavedCompany {
  id: string;
  notes: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    sector: string | null;
    website: string | null;
    location: string | null;
  };
}

export default function EntreprisesPage() {
  const { t } = useTranslation();
  const [savedCompanies, setSavedCompanies] = useState<SavedCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedCompanies();
  }, []);

  const fetchSavedCompanies = async () => {
    try {
      const res = await fetch("/api/companies/saved");
      const data = await res.json();
      setSavedCompanies(data.companies || []);
    } catch (error) {
      console.error("Error fetching saved companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (companyId: string) => {
    try {
      await fetch(`/api/companies/saved/${companyId}`, {
        method: "DELETE",
      });
      fetchSavedCompanies();
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-normal tracking-tight text-white flex items-center gap-3">
            <Star className="h-6 w-6 text-zinc-400" />
            {t("companies.title")}
          </h1>
          <p className="text-[13px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-1">
            Entreprises favorites et suivi des candidatures stratégiques
          </p>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
          {savedCompanies.length} {savedCompanies.length > 1 ? "entreprises" : "entreprise"}
        </div>
      </div>

      {savedCompanies.length === 0 ? (
        <Card className="border-dashed border-zinc-900 bg-transparent shadow-none">
          <CardContent className="py-20 text-center">
            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-full w-fit mx-auto mb-6">
              <Building2 className="h-8 w-8 text-zinc-700" />
            </div>
            <p className="text-zinc-500 font-medium mb-8">
              Aucune entreprise sauvegardée pour le moment
            </p>
          <Link href="/offres">
            <Button className="bg-black hover:bg-zinc-900 text-white h-11 px-10 font-serif italic text-sm rounded-full border border-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-xl">
              <Building2 className="mr-2 h-4 w-4 text-zinc-400" />
              {t("common.search")} {t("offers.title").toLowerCase()}
            </Button>
          </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedCompanies.map((saved) => (
            <Card key={saved.id} className="group bg-black border-zinc-900 shadow-none hover:border-zinc-700 transition-all duration-300 relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-900 group-hover:border-zinc-700 transition-colors">
                      <Building2 className="h-6 w-6 text-zinc-600 group-hover:text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-zinc-100 text-base truncate tracking-tight">
                        {saved.company.name}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {saved.company.sector && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-zinc-900 text-zinc-500 border border-zinc-800">
                            {saved.company.sector}
                          </span>
                        )}
                        {saved.company.location && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-600 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {saved.company.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFavorite(saved.id)}
                    className="h-8 w-8 p-0 text-zinc-700 hover:text-white hover:bg-zinc-900 rounded-full transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {saved.notes && (
                  <div className="bg-zinc-950/50 border border-zinc-900 rounded-xl p-3 mb-6">
                    <p className="text-[12px] text-zinc-500 font-medium leading-relaxed italic">
                      "{saved.notes}"
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-zinc-900">
                  <Button className="flex-1 bg-black hover:bg-zinc-900 text-white h-10 text-xs font-medium tracking-tight transition-all rounded-full border border-zinc-800 shadow-lg font-serif italic hover:scale-[1.02] active:scale-[0.98]">
                    <Send className="h-4 w-4 mr-2" />
                    Postuler
                  </Button>
                  {saved.company.website && (
                    <a
                      href={saved.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <Button variant="outline" size="sm" className="h-10 w-10 p-0 border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-full transition-all">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
