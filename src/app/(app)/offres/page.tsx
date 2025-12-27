"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, MapPin, Star, Building2, ExternalLink, Calendar, 
  Sparkles, Zap, TrendingUp, Filter, CheckCircle2, Briefcase, Download
} from "lucide-react";
import { SearchCompilationModal } from "@/components/search/search-compilation-modal";
import { Loader } from "@/components/ui/loader";
import { ScraperPreview } from "@/components/scraper/scraper-preview";

const PROVIDERS = [
  { id: "indeed", name: "Indeed", enabled: true },
  { id: "wttj", name: "WTTJ", enabled: true },
  { id: "hellowork", name: "HelloWork", enabled: true },
];

const CONTRACT_TYPES = [
  { id: "stage", label: "Stage" },
  { id: "alternance", label: "Alternance" },
  { id: "cdi", label: "CDI" },
  { id: "cdd", label: "CDD" },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 14) return "Il y a 1 semaine";
  return `Il y a ${Math.floor(diffDays / 7)} semaines`;
}

function calculateMatchScore(offerSkills: string[], userSkills: string[]): number {
  if (!userSkills.length || !offerSkills.length) return Math.floor(Math.random() * 30) + 50;
  
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const matchingSkills = offerSkills.filter(skill => 
    userSkillsLower.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us))
  );
  
  const score = Math.min(95, Math.floor((matchingSkills.length / offerSkills.length) * 100) + 40);
  return score;
}

interface JobOffer {
  id: string;
  title: string;
  companyName: string;
  location: string;
  contractType: string;
  matchScore: number;
  skills: string[];
  sourceProvider: string;
  sourceUrl?: string;
  publishedAt?: string;
}

interface UserProfile {
  id: string;
  name: string;
  skills: { name: string }[];
  profile: {
    preferredCities: string;
    contractTypes: string;
    domains: string;
  } | null;
}

export default function OffresPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedProviders, setSelectedProviders] = useState<string[]>(["indeed", "wttj", "hellowork"]);
  const [selectedContractTypes, setSelectedContractTypes] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchJobId, setSearchJobId] = useState<string | null>(null);
  const [results, setResults] = useState<JobOffer[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoSearchTriggered, setAutoSearchTriggered] = useState(false);
  const [savedOffers, setSavedOffers] = useState<Set<string>>(new Set());
  const [appliedOffers, setAppliedOffers] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // Extraire les skills de l'utilisateur
  const userSkills = userProfile?.skills?.map(s => s.name) || [];
  const userCities = userProfile?.profile?.preferredCities?.split(",").map(c => c.trim()).filter(Boolean) || [];
  const userDomains = userProfile?.profile?.domains?.split(",").map(d => d.trim()).filter(Boolean) || [];
  const userContractTypes = userProfile?.profile?.contractTypes?.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) || [];

  // Charger le profil utilisateur au montage
  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserProfile(data.user);
          
          // Pré-remplir avec les préférences utilisateur
          if (data.user.profile?.preferredCities) {
            setLocation(data.user.profile.preferredCities.split(",")[0].trim());
          }
          
          // Pré-remplir les types de contrat
          if (data.user.profile?.contractTypes) {
            const types = data.user.profile.contractTypes.split(",").map((t: string) => t.trim().toLowerCase());
            setSelectedContractTypes(types.filter((t: string) => CONTRACT_TYPES.some(ct => ct.id === t)));
          }
          
          // Pré-remplir la recherche avec les domaines d'intérêt ou les skills
          if (data.user.profile?.domains) {
            setQuery(data.user.profile.domains.split(",")[0].trim());
          } else if (data.user.skills?.length > 0) {
            setQuery(data.user.skills[0].name);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Auto-recherche quand le profil est chargé
  useEffect(() => {
    if (!loading && userProfile && query && !autoSearchTriggered && !hasSearched) {
      setAutoSearchTriggered(true);
      handleSearch();
    }
  }, [loading, userProfile, query, autoSearchTriggered, hasSearched]);

  const toggleProvider = (id: string) => {
    setSelectedProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleContractType = (id: string) => {
    setSelectedContractTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSkillClick = (skill: string) => {
    setQuery(skill);
  };

  const handleCityClick = (city: string) => {
    setLocation(city);
  };

  const handleQuickSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setTimeout(() => {
      handleSearchWithQuery(searchQuery);
    }, 100);
  };

  const handleSearchWithQuery = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          location,
          providers: selectedProviders,
          contractTypes: selectedContractTypes,
          userSkills,
        }),
      });

      const data = await res.json();
      if (data.id) {
        setSearchJobId(data.id);
      }
    } catch (error) {
      console.error("Search error:", error);
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    handleSearchWithQuery(query);
  };

  const handleSearchComplete = useCallback((jobResults: JobOffer[]) => {
    // Recalculer les scores de matching basés sur les skills utilisateur
    const resultsWithScores = jobResults.map(offer => ({
      ...offer,
      matchScore: calculateMatchScore(offer.skills, userSkills),
    }));
    
    // Trier par score de matching décroissant
    resultsWithScores.sort((a, b) => b.matchScore - a.matchScore);
    
    // Filtrer par type de contrat si sélectionné
    const filtered = selectedContractTypes.length > 0
      ? resultsWithScores.filter(o => selectedContractTypes.includes(o.contractType))
      : resultsWithScores;
    
    setResults(filtered);
    setIsSearching(false);
    setSearchJobId(null);
  }, [userSkills, selectedContractTypes]);

  const handleSearchCancel = () => {
    setIsSearching(false);
    setSearchJobId(null);
  };

  const handleSaveOffer = async (offer: JobOffer) => {
    if (savedOffers.has(offer.id)) return;
    setSavingId(offer.id);
    try {
      const res = await fetch("/api/saved-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer.id,
          matchScore: offer.matchScore,
        }),
      });
      if (res.ok) {
        setSavedOffers(prev => new Set([...prev, offer.id]));
      }
    } catch (error) {
      console.error("Error saving offer:", error);
    } finally {
      setSavingId(null);
    }
  };

  const handleApply = async (offer: JobOffer) => {
    if (appliedOffers.has(offer.id)) return;
    setApplyingId(offer.id);
    
    // Ouvrir le lien immédiatement
    if (offer.sourceUrl) {
      window.open(offer.sourceUrl, "_blank");
    }
    
    try {
      // Sauvegarder l'offre dans les favoris
      await fetch("/api/saved-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer.id,
          matchScore: offer.matchScore,
          notes: "Postulé le " + new Date().toLocaleDateString("fr-FR"),
        }),
      });
      
      setAppliedOffers(prev => new Set([...prev, offer.id]));
      setSavedOffers(prev => new Set([...prev, offer.id]));
    } catch (error) {
      console.error("Error saving applied offer:", error);
    } finally {
      setApplyingId(null);
    }
  };

  const handleExportCompaniesCSV = () => {
    window.open("/api/export/companies-csv", "_blank");
  };

  const handleExportOffersCSV = () => {
    window.open("/api/export/offers-csv", "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader size="lg" className="mx-auto mb-4" />
          <p className="text-zinc-400">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header personnalisé */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Offres pour vous
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Recherche personnalisée basée sur votre profil
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userSkills.length > 0 && (
            <div className="text-right mr-4">
              <p className="text-xs text-zinc-500">Vos compétences</p>
              <p className="text-sm font-medium text-zinc-300">{userSkills.length} skills détectés</p>
            </div>
          )}
          {/* Export CSV Buttons */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCompaniesCSV}
              className="bg-zinc-800 hover:bg-zinc-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Entreprises CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportOffersCSV}
              className="bg-zinc-800 hover:bg-zinc-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Offres CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Quick filters basés sur le profil */}
      {(userSkills.length > 0 || userDomains.length > 0) && (
        <Card className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-zinc-200">Recherche rapide</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {userDomains.slice(0, 3).map((domain) => (
                <Button
                  key={domain}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickSearch(domain)}
                  className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {domain}
                </Button>
              ))}
              {userSkills.slice(0, 4).map((skill) => (
                <Button
                  key={skill}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSearch(skill)}
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                >
                  {skill}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Barre de recherche principale */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Métier, compétences..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="relative w-40">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Ville"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>

          {/* Villes préférées */}
          {userCities.length > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-700">
              <MapPin className="h-3 w-3 text-zinc-500" />
              <span className="text-xs text-zinc-500">Vos villes:</span>
              {userCities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCityClick(city)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    location === city
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}

          {/* Types de contrat */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-700">
            <Filter className="h-3 w-3 text-zinc-500" />
            <span className="text-xs text-zinc-500">Contrat:</span>
            {CONTRACT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => toggleContractType(type.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                  selectedContractTypes.includes(type.id)
                    ? "bg-green-600 text-white"
                    : userContractTypes.includes(type.id)
                    ? "bg-zinc-600 text-zinc-200 ring-1 ring-green-500"
                    : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                }`}
              >
                {selectedContractTypes.includes(type.id) && <CheckCircle2 className="h-3 w-3" />}
                {type.label}
              </button>
            ))}
          </div>

          {/* Plateformes */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-700">
            <Briefcase className="h-3 w-3 text-zinc-500" />
            <span className="text-xs text-zinc-500">Sources:</span>
            {PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                onClick={() => toggleProvider(provider.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedProviders.includes(provider.id)
                    ? "bg-zinc-200 text-zinc-900"
                    : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                }`}
              >
                {provider.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills de l'utilisateur */}
      {userSkills.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500">Vos skills:</span>
          {userSkills.map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              className="cursor-pointer hover:bg-zinc-700 text-zinc-300 border-zinc-600"
              onClick={() => handleSkillClick(skill)}
            >
              {skill}
            </Badge>
          ))}
        </div>
      )}

      {/* Message si pas de recherche */}
      {!hasSearched && !isSearching && (
        <Card className="border-dashed border-zinc-700 bg-zinc-900/50">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-300 mb-2">
              Recherche personnalisée
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              {userSkills.length > 0 
                ? "Cliquez sur vos skills ou lancez une recherche pour trouver des offres adaptées à votre profil"
                : "Ajoutez des compétences dans votre profil pour des recommandations personnalisées"
              }
            </p>
            {userSkills.length === 0 && (
              <a href="/parametres#cv">
                <Button variant="outline">Importer mon CV</Button>
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Aucun résultat */}
      {hasSearched && !isSearching && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500">Aucune offre trouvée. Essayez d'autres critères.</p>
        </div>
      )}

      {/* Résultats */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              <span className="font-medium text-zinc-200">{results.length}</span> offres trouvées
            </p>
            <p className="text-xs text-zinc-500">
              Triées par compatibilité avec votre profil
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {results.map((offer) => (
              <Card 
                key={offer.id} 
                className={`hover:shadow-lg transition-all border-zinc-700 ${
                  offer.matchScore >= 80 ? "ring-1 ring-green-500/50" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">
                          {offer.sourceProvider}
                        </Badge>
                        {offer.contractType && (
                          <Badge 
                            className={
                              offer.contractType === "stage" 
                                ? "bg-blue-600 text-white" 
                                : offer.contractType === "alternance"
                                ? "bg-purple-600 text-white"
                                : "bg-green-600 text-white"
                            }
                          >
                            {offer.contractType}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-zinc-100">{offer.title}</h3>
                      <p className="text-sm text-zinc-400 font-medium">{offer.companyName}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {offer.location}
                        </span>
                        {offer.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(offer.publishedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        offer.matchScore >= 80 ? "text-green-400" :
                        offer.matchScore >= 60 ? "text-yellow-400" : "text-zinc-400"
                      }`}>
                        {offer.matchScore}%
                      </div>
                      <div className="text-xs text-zinc-500">match</div>
                    </div>
                  </div>

                  {offer.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-zinc-700">
                      {offer.skills.slice(0, 5).map((skill, i) => {
                        const isMatch = userSkills.some(us => 
                          us.toLowerCase().includes(skill.toLowerCase()) ||
                          skill.toLowerCase().includes(us.toLowerCase())
                        );
                        return (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className={`text-xs ${
                              isMatch 
                                ? "border-green-500 text-green-400 bg-green-500/10" 
                                : "border-zinc-600 text-zinc-400"
                            }`}
                          >
                            {isMatch && <CheckCircle2 className="h-2 w-2 mr-1" />}
                            {skill}
                          </Badge>
                        );
                      })}
                      {offer.skills.length > 5 && (
                        <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-500">
                          +{offer.skills.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-700">
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className={savedOffers.has(offer.id) ? "bg-yellow-600 text-white" : "bg-zinc-700 hover:bg-zinc-600"}
                        onClick={() => handleSaveOffer(offer)}
                        disabled={savingId === offer.id || savedOffers.has(offer.id)}
                      >
                        {savingId === offer.id ? (
                          <Loader size="sm" className="mr-1" />
                        ) : (
                          <Star className={`h-3 w-3 mr-1 ${savedOffers.has(offer.id) ? "fill-current" : ""}`} />
                        )}
                        {savedOffers.has(offer.id) ? "Sauvegardé" : "Sauvegarder"}
                      </Button>
                      <Button 
                        size="sm" 
                        className={appliedOffers.has(offer.id) ? "bg-green-600 hover:bg-green-500" : "bg-blue-600 hover:bg-blue-500"}
                        onClick={() => handleApply(offer)}
                        disabled={applyingId === offer.id || appliedOffers.has(offer.id)}
                      >
                        {applyingId === offer.id ? (
                          <Loader size="sm" className="mr-1" />
                        ) : appliedOffers.has(offer.id) ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <Building2 className="h-3 w-3 mr-1" />
                        )}
                        {appliedOffers.has(offer.id) ? "Postulé" : "Postuler"}
                      </Button>
                    </div>
                    {offer.sourceUrl && (
                      <a
                        href={offer.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                      >
                        Voir <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isSearching && searchJobId && (
        <SearchCompilationModal
          jobId={searchJobId}
          onComplete={handleSearchComplete}
          onCancel={handleSearchCancel}
        />
      )}

      {/* Scraper Preview - Live view */}
      <ScraperPreview 
        isActive={isSearching} 
        searchQuery={query}
        location={location}
        jobId={searchJobId || undefined}
      />
    </div>
  );
}
