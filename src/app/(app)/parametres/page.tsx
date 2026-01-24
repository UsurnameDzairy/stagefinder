"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus, Save, Trash2, Bell, BellRing, ToggleLeft, ToggleRight, Zap, Settings } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";

interface JobAlert {
  id: string;
  name: string;
  domains: string;
  keywords: string | null;
  locations: string | null;
  contractTypes: string | null;
  minMatchScore: number;
  isActive: boolean;
  frequency: string;
}

export default function ParametresPage() {
  const { t } = useTranslation();
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [preferredCities, setPreferredCities] = useState("");
  const [contractTypes, setContractTypes] = useState<string[]>([]);
  const [domains, setDomains] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // Alerts state
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: "",
    domains: "",
    keywords: "",
    locations: "",
    contractTypes: "",
    minMatchScore: 50,
    frequency: "daily",
  });

  // Charger le profil utilisateur et les alertes au montage
  useEffect(() => {
    // Charger le profil
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          if (data.user.skills && data.user.skills.length > 0) {
            setSkills(data.user.skills.map((s: any) => s.name));
          }
          if (data.user.profile) {
            setPreferredCities(data.user.profile.preferredCities || "");
            setDomains(data.user.profile.domains || "");
            if (data.user.profile.contractTypes) {
              setContractTypes(data.user.profile.contractTypes.split(",").map((t: string) => t.trim()));
            }
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Profile load error:", error);
        setLoading(false);
      });
    
    // Charger les alertes
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      if (data.alerts) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const createAlert = async () => {
    if (!newAlert.name || !newAlert.domains) return;
    
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlert),
      });
      
      if (res.ok) {
        fetchAlerts();
        setNewAlert({
          name: "",
          domains: "",
          keywords: "",
          locations: "",
          contractTypes: "",
          minMatchScore: 50,
          frequency: "daily",
        });
        setShowAlertForm(false);
      }
    } catch (error) {
      console.error("Error creating alert:", error);
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: alertId, isActive: !isActive }),
      });
      fetchAlerts();
    } catch (error) {
      console.error("Error toggling alert:", error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      await fetch(`/api/alerts?id=${alertId}`, { method: "DELETE" });
      fetchAlerts();
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  };

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const toggleContractType = (type: string) => {
    setContractTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const [uploadingCv, setUploadingCv] = useState(false);
  const [cvStatus, setCvStatus] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      if (file.size <= 5 * 1024 * 1024) {
        setCvFile(file);
        setUploadingCv(true);
        setCvStatus("Analyse du CV en cours...");
        
        // Upload le CV automatiquement
        const formData = new FormData();
        formData.append("file", file);
        
        try {
          const response = await fetch("/api/user/cv", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            
            // Si des données ont été extraites
            if (data.parsedData) {
              const extractedSkills = data.parsedData.skills || [];
              const extractedCities = data.parsedData.cities || [];
              const extractedDomains = data.parsedData.domains || [];
              
              // Mettre à jour les compétences
              if (extractedSkills.length > 0) {
                setSkills(extractedSkills);
              }
              // Mettre à jour les villes
              if (extractedCities.length > 0) {
                setPreferredCities(extractedCities.join(", "));
              }
              // Mettre à jour les domaines
              if (extractedDomains.length > 0) {
                setDomains(extractedDomains.join(", "));
              }
              
              setCvStatus(`✅ CV analysé! ${extractedSkills.length} compétences, ${extractedCities.length} villes, ${extractedDomains.length} domaines détectés.`);
            } else {
              setCvStatus("⚠️ CV uploadé mais aucune donnée extraite. Vérifiez le format du fichier.");
            }
          } else {
            setCvStatus("❌ Erreur lors de l'upload du CV");
          }
        } catch (error) {
          console.error("CV upload error:", error);
          setCvStatus("❌ Erreur lors de l'upload du CV");
        } finally {
          setUploadingCv(false);
        }
      } else {
        alert("Le fichier doit faire moins de 5MB");
      }
    } else {
      alert("Format non supporté. Utilisez PDF ou DOCX");
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredCities,
          contractTypes: contractTypes.join(", "),
          domains,
          skills,
        }),
      });

      if (response.ok) {
        alert("Paramètres enregistrés avec succès!");
      } else {
        alert("Erreur lors de l'enregistrement des paramètres");
      }
    } catch (error) {
      console.error("Save settings error:", error);
      alert("Erreur lors de l'enregistrement des paramètres");
    }
  };

  const handleExportData = () => {
    const data = {
      skills,
      preferredCities,
      contractTypes,
      domains,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stagefinder-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      alert("Fonctionnalité de suppression de compte à implémenter");
    }
  };

  const handleAvatarUrlSubmit = async () => {
    if (!avatarUrl.trim()) return;
    
    setUploadingAvatar(true);
    try {
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: avatarUrl }),
      });

      if (response.ok) {
        alert("Avatar mis à jour avec succès! Rafraîchissez la page pour voir les changements.");
        setAvatarUrl("");
      } else {
        alert("Erreur lors de la mise à jour de l'avatar");
      }
    } catch (error) {
      console.error("Avatar update error:", error);
      alert("Erreur lors de la mise à jour de l'avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm("Supprimer votre avatar ?")) return;
    
    setUploadingAvatar(true);
    try {
      const response = await fetch("/api/user/avatar", {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Avatar supprimé avec succès! Rafraîchissez la page pour voir les changements.");
      } else {
        alert("Erreur lors de la suppression de l'avatar");
      }
    } catch (error) {
      console.error("Avatar delete error:", error);
      alert("Erreur lors de la suppression de l'avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-serif font-normal tracking-tight text-white flex items-center gap-3">
          <Settings className="h-6 w-6 text-zinc-400" />
          {t("settings.title")}
        </h1>
        <p className="text-[13px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-1">
          Configuration du profil et préférences stratégiques
        </p>
      </div>

      <div className="grid gap-8">
        {/* Avatar Section */}
        <Card className="bg-black border-zinc-900 shadow-none overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Identité Visuelle</CardTitle>
            <CardDescription className="text-[13px] text-zinc-600 font-medium">Personnalisez votre profil professionnel</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-zinc-950 border border-zinc-900 rounded-2xl">
              <div className="h-20 w-20 rounded-full border-2 border-zinc-800 bg-black flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="h-8 w-8 text-zinc-800" />
                )}
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="URL de votre image (ex: LinkedIn, Gravatar...)"
                    disabled={uploadingAvatar}
                    className="h-10 bg-black border-zinc-900 focus:border-white transition-all text-sm"
                  />
                  <Button 
                    onClick={handleAvatarUrlSubmit} 
                    disabled={uploadingAvatar || !avatarUrl.trim()}
                    className="bg-black hover:bg-zinc-900 text-white font-serif italic text-sm px-8 h-10 rounded-full border border-zinc-800 shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    {uploadingAvatar ? <Loader size="sm" /> : "Update"}
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                    className="h-8 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest border-zinc-900 text-zinc-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Remove
                  </Button>
                  <span className="text-[10px] font-medium text-zinc-700 self-center uppercase tracking-wider">Recommandé: 200x200px</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CV Section */}
        <Card id="cv" className="bg-black border-zinc-900 shadow-none">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Base Documentaire</CardTitle>
            <CardDescription className="text-[13px] text-zinc-600 font-medium">Extraction automatique par IA pour un matching chirurgical</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="border-2 border-dashed border-zinc-900 hover:border-zinc-700 bg-zinc-950/30 rounded-2xl p-10 text-center transition-all duration-300 group cursor-pointer" onClick={handleFileSelect}>
              {uploadingCv ? (
                <div className="space-y-4">
                  <Loader size="lg" className="mx-auto" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-white uppercase tracking-[0.2em] animate-pulse">Intelligence Engine Processing...</p>
                    <p className="text-[12px] text-zinc-600 font-medium italic">Analyse sémantique de votre parcours</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl w-fit mx-auto group-hover:border-zinc-600 transition-all">
                    <Upload className="h-8 w-8 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[13px] font-bold text-zinc-300 group-hover:text-white transition-colors">
                      {cvFile ? cvFile.name : "Cliquez pour importer votre CV"}
                    </p>
                    <p className="text-[11px] font-bold text-zinc-700 uppercase tracking-widest">PDF ou DOCX (Max 5MB)</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-10 px-8 rounded-full border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-900 text-[11px] font-bold uppercase tracking-widest transition-all">
                    {cvFile ? "Change file" : "Select file"}
                  </Button>
                </div>
              )}
            </div>
            {cvStatus && (
              <div className={cn(
                "mt-6 p-4 rounded-xl text-[12px] font-medium leading-relaxed border animate-in fade-in slide-in-from-top-2",
                cvStatus.includes("✅") ? "bg-zinc-950 border-zinc-800 text-zinc-300" :
                cvStatus.includes("⚠️") ? "bg-zinc-950 border-zinc-900 text-zinc-500" :
                "bg-zinc-950 border-zinc-900 text-red-400"
              )}>
                {cvStatus}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Skills Section */}
          <Card className="bg-black border-zinc-900 shadow-none">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Hard & Soft Skills</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-6">
              <div className="flex flex-wrap gap-1.5 min-h-[40px]">
                {skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-400 group">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-zinc-700 hover:text-white transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Python, Finance, Leadership..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  className="h-10 bg-zinc-950 border-zinc-900 focus:border-white transition-all text-sm"
                />
                <Button onClick={addSkill} className="bg-black hover:bg-zinc-900 text-white h-10 w-10 p-0 border border-zinc-800 rounded-full shadow-lg transition-all hover:scale-110 active:scale-90">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card className="bg-black border-zinc-900 shadow-none">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Paramètres de Recherche</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Villes cibles</label>
                <Input
                  placeholder="Paris, London, Remote..."
                  value={preferredCities}
                  onChange={(e) => setPreferredCities(e.target.value)}
                  className="h-10 bg-zinc-950 border-zinc-900 focus:border-white transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Formats contractuels</label>
                <div className="flex flex-wrap gap-2">
                  {["stage", "alternance", "cdi", "cdd"].map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleContractType(type)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest border transition-all",
                        contractTypes.includes(type)
                          ? "bg-zinc-800 border-zinc-600 text-white shadow-inner"
                          : "bg-black border-zinc-900 text-zinc-600 hover:border-zinc-700"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Domaines d'expertise</label>
                <Input
                  placeholder="Banking, AI, Web Dev..."
                  value={domains}
                  onChange={(e) => setDomains(e.target.value)}
                  className="h-10 bg-zinc-950 border-zinc-900 focus:border-white transition-all text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section Premium */}
        <Card id="alerts" className="bg-black border-zinc-900 shadow-none overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Bell className="h-32 w-32 text-white" />
          </div>
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
              <BellRing className="h-4 w-4 text-zinc-400" />
              Système d'Alertes Stratégiques
            </CardTitle>
            <CardDescription className="text-[13px] text-zinc-600 font-medium">Surveillance en temps réel des flux d'opportunités</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-6">
            {alerts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-5 rounded-2xl border transition-all duration-300 relative group",
                      alert.isActive ? "bg-zinc-950 border-zinc-800" : "bg-black border-zinc-900 opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-[14px] text-zinc-100 tracking-tight">{alert.name}</h4>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {alert.domains.split(",").map((d) => (
                            <span key={d} className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-zinc-900 text-zinc-500 border border-zinc-800">
                              {d.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => toggleAlert(alert.id, alert.isActive)}
                          className="h-8 w-8 rounded-full border border-zinc-900 flex items-center justify-center hover:border-zinc-600 transition-all"
                        >
                          {alert.isActive ? (
                            <ToggleRight className="h-5 w-5 text-white" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-zinc-700" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="h-8 w-8 rounded-full border border-zinc-900 flex items-center justify-center hover:border-zinc-700 hover:bg-zinc-900 text-zinc-700 hover:text-white transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-widest pt-4 border-t border-zinc-900/50">
                      <span>{alert.locations || "Global"}</span>
                      <span>Min Score: {alert.minMatchScore}%</span>
                      <span>{alert.frequency}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-zinc-950/30 border border-dashed border-zinc-900 rounded-3xl space-y-4">
                <div className="p-4 bg-black border border-zinc-900 rounded-full w-fit mx-auto">
                  <Bell className="h-6 w-6 text-zinc-800" />
                </div>
                <p className="text-[13px] font-medium text-zinc-600">Aucune surveillance active configurée.</p>
              </div>
            )}

            {showAlertForm ? (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-top-4">
                <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Configuration de l'alerte</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Nom du flux *</label>
                    <Input
                      placeholder="Ex: Banking London"
                      value={newAlert.name}
                      onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                      className="bg-black border-zinc-900 h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Secteurs *</label>
                    <Input
                      placeholder="Tech, Luxury..."
                      value={newAlert.domains}
                      onChange={(e) => setNewAlert({ ...newAlert, domains: e.target.value })}
                      className="bg-black border-zinc-900 h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Localisations</label>
                    <Input
                      placeholder="Paris, New York..."
                      value={newAlert.locations}
                      onChange={(e) => setNewAlert({ ...newAlert, locations: e.target.value })}
                      className="bg-black border-zinc-900 h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Fréquence</label>
                    <select
                      value={newAlert.frequency}
                      onChange={(e) => setNewAlert({ ...newAlert, frequency: e.target.value })}
                      className="w-full h-10 px-4 rounded-xl bg-black border border-zinc-900 text-sm font-medium"
                    >
                      <option value="instant">Temps Réel</option>
                      <option value="daily">Quotidien</option>
                      <option value="weekly">Hebdomadaire</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-zinc-900">
                  <Button onClick={() => setShowAlertForm(false)} variant="ghost" className="h-10 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white rounded-full">Annuler</Button>
                  <Button onClick={createAlert} className="flex-1 bg-black hover:bg-zinc-900 text-white font-serif italic text-sm rounded-full border border-zinc-800 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">Activer la surveillance</Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowAlertForm(true)}
                className="w-full h-12 border-zinc-900 bg-black hover:bg-zinc-900 text-zinc-400 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une nouvelle règle de flux
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Account Controls Section Premium */}
        <Card className="bg-black border-zinc-900 shadow-none border-zinc-800/20">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Commandes Systèmes</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-900 rounded-2xl transition-all hover:border-zinc-800 group">
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-zinc-200 group-hover:text-white">Portabilité des données</p>
                <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">Téléchargement archive RGPD</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportData} className="h-9 px-8 rounded-full border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-widest">Exporter</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-900 rounded-2xl transition-all hover:border-zinc-800 group">
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-zinc-500 group-hover:text-zinc-200">Destruction du compte</p>
                <p className="text-[11px] font-medium text-zinc-700 uppercase tracking-wider">Cette action est irréversible</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDeleteAccount} className="h-9 px-8 rounded-full text-zinc-700 hover:text-white hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-widest transition-all">Supprimer</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            onClick={handleSaveSettings} 
            className="bg-black hover:bg-zinc-900 text-white h-12 px-10 rounded-full border border-zinc-800 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] font-serif italic text-base hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="h-4 w-4 mr-3" />
            Sauvegarder la configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
