"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, MapPin, Star, Building2, ExternalLink, Calendar, 
  Sparkles, Zap, TrendingUp, Filter, CheckCircle2, Briefcase, Download, FileText, Send, Target
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const PROVIDERS = [
  { id: "linkedin", name: "LinkedIn", icon: "", color: "bg-zinc-900" },
  { id: "indeed", name: "Indeed", icon: "", color: "bg-zinc-900" },
  { id: "hellowork", name: "HelloWork", icon: "", color: "bg-zinc-900" },
  { id: "wttj", name: "WTTJ", icon: "", color: "bg-zinc-900" },
];

const CONTRACT_TYPES = [
  { id: "stage", label: "Stage", icon: "", color: "bg-zinc-900" },
  { id: "alternance", label: "Alternance", icon: "", color: "bg-zinc-900" },
  { id: "cdi", label: "CDI", icon: "", color: "bg-zinc-900" },
  { id: "cdd", label: "CDD", icon: "", color: "bg-zinc-900" },
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
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedProviders, setSelectedProviders] = useState<string[]>(["linkedin", "indeed", "hellowork", "wttj"]);
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
  const [isSmartSearching, setIsSmartSearching] = useState(false);
  const [smartSearchResults, setSmartSearchResults] = useState<any>(null);
  const [isCvSearching, setIsCvSearching] = useState(false);
  const [cvSearchResults, setCvSearchResults] = useState<any>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("FREE");

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
          
          // Get user subscription plan
          if (data.user.subscription?.plan) {
            setUserPlan(data.user.subscription.plan);
          }
          
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

  // Ajouter une ville aux préférences quand on fait une recherche
  const addCityToPreferences = async (city: string) => {
    if (!city.trim() || userCities.includes(city)) return;
    
    const newCities = [city, ...userCities.filter(c => c !== city)].slice(0, 5);
    const newCitiesStr = newCities.join(", ");
    
    // Mettre à jour localement
    if (userProfile?.profile) {
      setUserProfile({
        ...userProfile,
        profile: {
          ...userProfile.profile,
          preferredCities: newCitiesStr,
        },
      });
    }
    
    // Sauvegarder en base
    try {
      await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredCities: newCitiesStr,
        }),
      });
    } catch (error) {
      console.error("Failed to update preferred cities:", error);
    }
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

    // Ajouter la ville aux préférences si elle est nouvelle
    if (location.trim()) {
      addCityToPreferences(location.trim());
    }

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

  // Smart Search IA - Recherche intelligente basée sur le profil
  const handleSmartSearch = async () => {
    setIsSmartSearching(true);
    setHasSearched(true);
    
    try {
      const res = await fetch("/api/smart-scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await res.json();
      
      if (data.success && data.data) {
        setSmartSearchResults(data.data);
        
        // Convertir les résultats au format attendu
        const formattedResults: JobOffer[] = data.data.topMatches.map((offer: any, index: number) => ({
          id: `smart-${index}-${Date.now()}`,
          title: offer.title,
          companyName: offer.company,
          location: offer.location,
          contractType: offer.contractType,
          matchScore: offer.matchScore,
          skills: offer.skills || [],
          sourceProvider: offer.source,
          sourceUrl: offer.url,
          publishedAt: new Date().toISOString(),
        }));
        
        setResults(formattedResults);
      }
    } catch (error) {
      console.error("Smart search error:", error);
    } finally {
      setIsSmartSearching(false);
    }
  };

  // Recherche basée sur le CV avec proximité géographique
  const handleCvSearch = async () => {
    setIsCvSearching(true);
    setHasSearched(true);
    setCvSearchResults(null);
    setSelectedZone(null);
    
    try {
      const contractType = selectedContractTypes.length > 0 ? selectedContractTypes[0] : "stage";
      
      const res = await fetch("/api/cv-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractType, maxResults: 50 }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setCvSearchResults(data);
        
        // Convertir les résultats au format attendu
        const formattedResults: JobOffer[] = data.offers.map((offer: any, index: number) => ({
          id: offer.id || `cv-${index}-${Date.now()}`,
          title: offer.title,
          companyName: offer.company,
          location: offer.location,
          contractType: offer.contractType || contractType,
          matchScore: offer.score,
          skills: offer.skills || [],
          sourceProvider: offer.source || "cv-search",
          sourceUrl: offer.url,
          publishedAt: new Date().toISOString(),
          zone: offer.zone,
          distanceFromUser: offer.distanceFromUser,
        }));
        
        setResults(formattedResults);
      }
    } catch (error) {
      console.error("CV search error:", error);
    } finally {
      setIsCvSearching(false);
    }
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
      // Créer une candidature dans la base de données
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer.id,
          companyName: offer.companyName,
          jobTitle: offer.title,
          companyUrl: offer.sourceUrl,
          notes: `Postulé via ${offer.sourceProvider} le ${new Date().toLocaleDateString("fr-FR")}`,
        }),
      });
      
      if (res.ok) {
        setAppliedOffers(prev => new Set([...prev, offer.id]));
        
        // Aussi sauvegarder dans les favoris
        await fetch("/api/saved-offers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            offerId: offer.id,
            matchScore: offer.matchScore,
            notes: "Postulé le " + new Date().toLocaleDateString("fr-FR"),
          }),
        });
        setSavedOffers(prev => new Set([...prev, offer.id]));
      }
    } catch (error) {
      console.error("Error creating application:", error);
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
          <h1 className="text-4xl font-serif font-normal tracking-tight text-white flex items-center gap-3">
            {t("offers.title")}
          </h1>
          <p className="text-[13px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-1">
            {t("offers.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userSkills.length > 0 && (
            <div className="text-right mr-4">
              <p className="text-xs text-zinc-500">{t("common.skills")}</p>
              <p className="text-sm font-medium text-zinc-300">{userSkills.length} {t("common.skills").toLowerCase()}</p>
            </div>
          )}
          {/* Export CSV Buttons */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCompaniesCSV}
              className="bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-white h-9 px-6 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              {t("companies.title")} CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportOffersCSV}
              className="bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-white h-9 px-6 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              {t("offers.title")} CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Quick filters basés sur le profil */}
      {(userSkills.length > 0 || userDomains.length > 0) && (
        <Card className="bg-zinc-950 border-zinc-900 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-zinc-900 rounded-md border border-zinc-800">
                  <TrendingUp className="h-3.5 w-3.5 text-zinc-400" />
                </div>
                <span className="text-[13px] font-semibold text-zinc-200 tracking-tight">{t("offers.search")}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCvSearch}
                  disabled={isCvSearching}
                  variant="outline"
                  className="bg-black hover:bg-zinc-900 border-zinc-800 text-white text-xs h-9 px-6 rounded-full font-serif italic transition-all hover:scale-[1.02] active:scale-[0.98]"
                  size="sm"
                >
                  {isCvSearching ? (
                    <Loader size="sm" />
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5 mr-2 text-zinc-500" />
                      CV Search
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleSmartSearch}
                  disabled={isSmartSearching}
                  className="bg-black hover:bg-zinc-900 text-white text-xs font-serif italic h-9 px-6 rounded-full border border-zinc-800 transition-all hover:scale-[1.05] active:scale-[0.95]"
                  size="sm"
                >
                  {isSmartSearching ? (
                    <Loader size="sm" />
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5 mr-2" />
                      Smart Search
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {userDomains.slice(0, 3).map((domain) => (
                <button
                  key={domain}
                  onClick={() => handleQuickSearch(domain)}
                  className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-medium hover:text-white hover:border-zinc-600 transition-all"
                >
                  {domain}
                </button>
              ))}
              {userSkills.slice(0, 4).map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleQuickSearch(skill)}
                  className="px-3 py-1.5 rounded-full border border-dashed border-zinc-800 text-zinc-500 text-[11px] font-medium hover:text-zinc-300 hover:border-zinc-700 transition-all"
                >
                  {skill}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Barre de recherche principale */}
      <Card className="bg-black border-zinc-900 shadow-none">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
              <Input
                placeholder={t("offers.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-11 bg-zinc-950 border-zinc-900 focus:border-zinc-700 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="relative w-full md:w-48">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
              <Input
                placeholder={t("offers.location")}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 h-11 bg-zinc-950 border-zinc-900 focus:border-zinc-700 text-sm"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !query.trim()}
              className="bg-black hover:bg-zinc-900 text-white font-serif italic text-base px-8 h-11 rounded-full border border-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto"
            >
              <Search className="mr-2 h-4 w-4" />
              {t("offers.search")}
            </Button>
          </div>

          {/* Villes préférées */}
          {userCities.length > 0 && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-900">
              <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">{t("offers.location")}:</span>
              <div className="flex gap-1.5">
                {userCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCityClick(city)}
                    className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                      location === city
                        ? "bg-zinc-800 text-white border border-zinc-700 shadow-inner"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Types de contrat */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-900">
            <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">{t("offers.contractTypes")}:</span>
            <div className="flex gap-1.5">
              {CONTRACT_TYPES.map((type) => (
                  <button
                  key={type.id}
                  onClick={() => toggleContractType(type.id)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-medium border transition-all flex items-center gap-2 ${
                    selectedContractTypes.includes(type.id)
                      ? "bg-zinc-800 border-zinc-600 text-white shadow-sm"
                      : "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plateformes */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-900">
            <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">Sources:</span>
            <div className="flex gap-1.5">
              {PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => toggleProvider(provider.id)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-medium border transition-all flex items-center gap-2 ${
                    selectedProviders.includes(provider.id)
                      ? "bg-zinc-800 border-zinc-600 text-white shadow-sm"
                      : "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                  }`}
                >
                  {provider.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills de l'utilisateur - Version compacte avec toggle */}
      {userSkills.length > 0 && (
        <div className="flex flex-col gap-3 px-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 mr-1">
              <div className="p-1 bg-zinc-900 rounded-md border border-zinc-800">
                <Target className="h-3 w-3 text-zinc-500" />
              </div>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Vos skills:</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 flex-1">
              {(showAllSkills ? userSkills : userSkills.slice(0, 8)).map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="cursor-pointer bg-black hover:bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700 transition-all text-[10px] font-medium px-2.5 py-0.5 rounded-full"
                  onClick={() => handleSkillClick(skill)}
                >
                  {skill}
                </Badge>
              ))}
              
              {userSkills.length > 8 && (
                <button 
                  onClick={() => setShowAllSkills(!showAllSkills)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-900 text-[10px] font-bold text-zinc-500 hover:text-white hover:border-zinc-700 transition-all group"
                >
                  {showAllSkills ? (
                    <>Voir moins</>
                  ) : (
                    <>
                      Voir plus 
                      <span className="text-zinc-700 group-hover:text-zinc-500">({userSkills.length - 8})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
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

          <div className="grid gap-6 lg:grid-cols-2">
            {results.map((offer, index) => {
              // Blur every 3rd offer for free users
              const shouldBlur = userPlan === "FREE" && (index + 1) % 3 === 0;
              
              return (
              <Card 
                key={offer.id} 
                className={`group hover:border-zinc-500 transition-all duration-300 bg-black border-zinc-900 shadow-none relative overflow-hidden ${
                  offer.matchScore >= 80 ? "border-zinc-700" : ""
                }`}
              >
                {offer.matchScore >= 80 && (
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-zinc-800 text-white text-[9px] font-bold uppercase tracking-wider border-l border-b border-zinc-700">
                    High Match
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-zinc-800 text-zinc-500 font-bold bg-transparent">
                          {offer.sourceProvider}
                        </Badge>
                        <Badge 
                            variant="outline"
                            className="text-[10px] uppercase tracking-widest border-zinc-700 text-zinc-200 font-bold bg-zinc-900"
                          >
                            {offer.contractType}
                          </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-zinc-100 mb-1 group-hover:text-white transition-colors">
                        {offer.title}
                      </h3>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-zinc-400 flex items-center gap-1.5 font-medium">
                          <Building2 className="h-3.5 w-3.5 text-zinc-600" />
                          {offer.companyName}
                        </span>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
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
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="text-xl font-bold tracking-tighter text-white">
                        {offer.matchScore}%
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">score</div>
                    </div>
                  </div>

                  {offer.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-zinc-900">
                      {offer.skills.slice(0, 6).map((skill, i) => {
                        const isMatch = userSkills.some(us => 
                          us.toLowerCase().includes(skill.toLowerCase()) ||
                          skill.toLowerCase().includes(us.toLowerCase())
                        );
                        return (
                          <span 
                            key={i} 
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              isMatch 
                                ? "border-zinc-600 text-zinc-200 bg-zinc-800" 
                                : "border-zinc-900 text-zinc-600 bg-transparent"
                            }`}
                          >
                            {skill}
                          </span>
                        );
                      })}
                      {offer.skills.length > 6 && (
                        <span className="text-[10px] text-zinc-600 self-center ml-1">
                          +{offer.skills.length - 6}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-900">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                          "h-8 text-[11px] font-bold uppercase tracking-wider transition-all",
                          savedOffers.has(offer.id) 
                            ? "bg-zinc-900 text-white border-zinc-700 shadow-inner" 
                            : "bg-black text-white border-zinc-800 hover:bg-zinc-900"
                        )}
                        onClick={() => handleSaveOffer(offer)}
                        disabled={savingId === offer.id || savedOffers.has(offer.id)}
                      >
                        {savingId === offer.id ? (
                          <Loader size="sm" />
                        ) : (
                          <>
                            <Star className={cn("h-3 w-3 mr-2", savedOffers.has(offer.id) ? "fill-current" : "")} />
                            {savedOffers.has(offer.id) ? t("common.saved") : t("common.save")}
                          </>
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        className={cn(
                          "h-8 px-6 text-[11px] font-bold uppercase tracking-wider transition-all rounded-full font-serif italic",
                          appliedOffers.has(offer.id) 
                            ? "bg-zinc-800 text-zinc-500 cursor-default border-zinc-800" 
                            : "bg-black text-white hover:bg-zinc-900 border border-zinc-800 shadow-lg hover:scale-[1.05] active:scale-[0.95]"
                        )}
                        onClick={() => handleApply(offer)}
                        disabled={applyingId === offer.id || appliedOffers.has(offer.id)}
                      >
                        {applyingId === offer.id ? (
                          <Loader size="sm" />
                        ) : appliedOffers.has(offer.id) ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {t("applications.status.applied")}
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            {t("common.apply")}
                          </>
                        )}
                      </Button>
                    </div>
                    {offer.sourceUrl && (
                      <a
                        href={offer.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        Details <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
                
                {/* Blur overlay for free users */}
                {shouldBlur && (
                  <div className="absolute inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center z-10">
                    <div className="text-center p-6 space-y-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 mb-2">
                        <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        {t("common.upgradeRequired")}
                      </h3>
                      <p className="text-sm text-zinc-400 max-w-xs">
                        {t("common.upgradeMessage")}
                      </p>
                      <a href="/parametres">
                        <Button className="mt-2 bg-white text-black hover:bg-zinc-200">
                          {t("common.upgradePlan")}
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </Card>
            );
            })}
          </div>
        </div>
      )}

      {/* Recherche intégrée dans la page */}
      {isSearching && searchJobId && (
        <InlineScraperStatus
          jobId={searchJobId}
          searchQuery={query}
          location={location}
          onComplete={handleSearchComplete}
          onCancel={handleSearchCancel}
        />
      )}
    </div>
  );
}

// Composant de statut de recherche intégré dans la page
function InlineScraperStatus({
  jobId,
  searchQuery,
  location,
  onComplete,
  onCancel,
}: {
  jobId: string;
  searchQuery: string;
  location: string;
  onComplete: (results: any[]) => void;
  onCancel: () => void;
}) {
  const { t, language } = useTranslation();
  const [status, setStatus] = useState<any>(null);
  const [elapsed, setElapsed] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const SOURCES = [
    { id: "linkedin", name: "LinkedIn", color: "bg-zinc-100", icon: "" },
    { id: "indeed", name: "Indeed", color: "bg-zinc-400", icon: "" },
    { id: "hellowork", name: "HelloWork", color: "bg-zinc-600", icon: "" },
    { id: "wttj", name: "WTTJ", color: "bg-zinc-800", icon: "" },
  ];

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/search-jobs/${jobId}`);
        if (!res.ok) return;
        
        const data = await res.json();
        setStatus(data);

        // Ajouter des logs
        if (data.step === "PROVIDER_FETCH") {
          setLogs(prev => {
            const newLog = `[${new Date().toLocaleTimeString()}] Recherche en cours...`;
            if (!prev.includes(newLog)) return [...prev.slice(-4), newLog];
            return prev;
          });
        }

        if (data.status === "DONE") {
          setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Recherche terminée!`]);
          const resultsRes = await fetch(`/api/search-jobs/${jobId}/results`);
          const results = await resultsRes.json();
          setTimeout(() => onComplete(results.offers || []), 500);
        } else if (data.status === "FAILED" || data.status === "CANCELED") {
          onCancel();
        }
      } catch (error) {
        console.error("Poll error:", error);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 1500);
    return () => clearInterval(interval);
  }, [jobId, onComplete, onCancel]);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Logs initiaux
    const startMsg = language === "fr" ? "Démarrage de la recherche..." : "Starting search...";
    const criteriaMsg = language === "fr" ? "Critères" : "Criteria";
    const connectMsg = language === "fr" ? "Connexion aux plateformes..." : "Connecting to platforms...";
    setLogs([
      `[${new Date().toLocaleTimeString()}] 🚀 ${startMsg}`,
      `[${new Date().toLocaleTimeString()}] 📍 ${criteriaMsg}: "${searchQuery}" - ${location || "France"}`,
      `[${new Date().toLocaleTimeString()}] 🔗 ${connectMsg}`,
    ]);
  }, [searchQuery, location, language]);

  const progress = status?.progress || 0;
  
  // Simulation d'une progression fluide si bloqué ou trop lent
  const [displayProgress, setDisplayProgress] = useState(0);
  
  useEffect(() => {
    if (progress > displayProgress) {
      const diff = progress - displayProgress;
      const step = diff > 10 ? 2 : 0.5;
      const timer = setTimeout(() => {
        setDisplayProgress(prev => Math.min(progress, prev + step));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [progress, displayProgress]);

  const handleCancel = async () => {
    try {
      await fetch(`/api/search-jobs/${jobId}/cancel`, { method: "POST" });
    } catch (error) {}
    onCancel();
  };

  return (
    <Card className="border-zinc-900 bg-black shadow-none overflow-hidden">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              {t("offers.searching")}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white tracking-tighter">{Math.floor(displayProgress)}%</div>
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
              {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Barre de progression épurée */}
        <div className="mb-10">
          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>

        {/* Sources monochrome */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {SOURCES.map((source) => {
            const sourceStatus = status?.providerStatuses?.[source.id];
            const isDone = sourceStatus?.status === "done";
            const isRunning = sourceStatus?.status === "running";
            const count = sourceStatus?.count || 0;

            return (
              <div 
                key={source.id}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-300",
                  isDone 
                    ? "bg-zinc-900 border-zinc-700" 
                    : isRunning 
                    ? "bg-zinc-900/50 border-zinc-800 animate-pulse" 
                    : "bg-black border-zinc-900 opacity-40"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">{source.name}</span>
                </div>
                <div className="text-[11px] font-medium">
                  {isDone ? (
                    <span className="text-white">✓ {count} {language === "fr" ? "offres" : "jobs"}</span>
                  ) : isRunning ? (
                    <span className="text-zinc-500">{t("offers.searchInProgress")}</span>
                  ) : (
                    <span className="text-zinc-600">{t("offers.waiting")}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Console de logs monochrome */}
        <div className="bg-[#050505] border border-zinc-900 rounded-xl p-5 font-mono">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-900">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
            </div>
            <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">system.log</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-hide">
            {logs.map((log, i) => (
              <div key={i} className="text-[11px] leading-relaxed">
                <span className="text-zinc-700 mr-3">[{log.split(']')[0].split('[')[1]}]</span>
                <span className="text-zinc-300">{log.split(']')[1]}</span>
              </div>
            ))}
            <div className="text-white animate-pulse text-[11px]">{'>'} _</div>
          </div>
        </div>

        {/* Infos et bouton annuler épuré */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-900">
          <div className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider flex gap-4">
            <span className="flex items-center gap-1.5"><Search className="h-3 w-3" /> {searchQuery}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {location || "France"}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleCancel}
            className="h-9 px-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/[0.03] rounded-full transition-all"
          >
            {t("offers.cancel")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
