"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus, Save, Trash2, Bell, BellRing, ToggleLeft, ToggleRight, Zap, Settings, User, Check } from "lucide-react";
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
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("zinc");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Predefined avatars (emoji-style)
  const avatarOptions = [
    { id: "default", icon: "user" },
    { id: "briefcase", icon: "💼" },
    { id: "rocket", icon: "🚀" },
    { id: "star", icon: "⭐" },
    { id: "fire", icon: "🔥" },
    { id: "brain", icon: "🧠" },
    { id: "target", icon: "🎯" },
    { id: "diamond", icon: "💎" },
  ];

  // Predefined colors
  const colorOptions = [
    { id: "zinc", color: "bg-zinc-800", border: "border-zinc-600" },
    { id: "blue", color: "bg-blue-600", border: "border-blue-400" },
    { id: "purple", color: "bg-purple-600", border: "border-purple-400" },
    { id: "green", color: "bg-emerald-600", border: "border-emerald-400" },
    { id: "orange", color: "bg-orange-600", border: "border-orange-400" },
    { id: "pink", color: "bg-pink-600", border: "border-pink-400" },
    { id: "cyan", color: "bg-cyan-600", border: "border-cyan-400" },
    { id: "red", color: "bg-red-600", border: "border-red-400" },
  ];
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
        setCvStatus(t("settings.cv.analyzing"));

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
              
              setCvStatus(`✅ ${t("settings.cv.success").replace("{skills}", String(extractedSkills.length)).replace("{cities}", String(extractedCities.length)).replace("{domains}", String(extractedDomains.length))}`);
            } else {
              setCvStatus(`⚠️ ${t("settings.cv.warning")}`);
            }
          } else {
            setCvStatus(`❌ ${t("settings.cv.error")}`);
          }
        } catch (error) {
          console.error("CV upload error:", error);
          setCvStatus(`❌ ${t("settings.cv.error")}`);
        } finally {
          setUploadingCv(false);
        }
      } else {
        alert(t("settings.cv.fileTooLarge"));
      }
    } else {
      alert(t("settings.cv.unsupportedFormat"));
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
        alert(t("settings.saveSuccess"));
      } else {
        alert(t("settings.saveError"));
      }
    } catch (error) {
      console.error("Save settings error:", error);
      alert(t("settings.saveError"));
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
    if (confirm(t("settings.account.delete.confirm"))) {
      alert("Account deletion feature to be implemented");
    }
  };

  const handleAvatarSave = async () => {
    setUploadingAvatar(true);
    try {
      const avatarData = `${selectedColor}:${selectedAvatar || "default"}`;
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarData }),
      });

      if (response.ok) {
        alert(t("settings.avatar.updateSuccess"));
      } else {
        alert(t("settings.avatar.updateError"));
      }
    } catch (error) {
      console.error("Avatar update error:", error);
      alert(t("settings.avatar.updateError"));
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
          {t("settings.subtitle")}
        </p>
      </div>

      <div className="grid gap-8">
        {/* Avatar Section */}
        <Card className="bg-black border-zinc-900 shadow-none overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{t("settings.avatar.title")}</CardTitle>
            <CardDescription className="text-[13px] text-zinc-600 font-medium">{t("settings.avatar.description")}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-6">
            <div className="flex flex-col sm:flex-row items-start gap-6 p-5 bg-zinc-950 border border-zinc-900 rounded-2xl">
              {/* Avatar Preview */}
              <div className={cn(
                "h-24 w-24 rounded-full flex items-center justify-center text-3xl shrink-0 transition-all duration-300",
                colorOptions.find(c => c.id === selectedColor)?.color || "bg-zinc-800"
              )}>
                {selectedAvatar && selectedAvatar !== "default" ? (
                  <span>{avatarOptions.find(a => a.id === selectedAvatar)?.icon}</span>
                ) : (
                  <User className="h-10 w-10 text-white/80" />
                )}
              </div>

              <div className="flex-1 space-y-5 w-full">
                {/* Color Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Background Color</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.id)}
                        className={cn(
                          "h-8 w-8 rounded-full transition-all duration-200 flex items-center justify-center",
                          color.color,
                          selectedColor === color.id
                            ? `ring-2 ring-offset-2 ring-offset-zinc-950 ${color.border} scale-110`
                            : "hover:scale-110 opacity-70 hover:opacity-100"
                        )}
                      >
                        {selectedColor === color.id && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avatar Icon Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Avatar Style</label>
                  <div className="flex flex-wrap gap-2">
                    {avatarOptions.map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => setSelectedAvatar(avatar.id)}
                        className={cn(
                          "h-10 w-10 rounded-xl bg-zinc-900 border transition-all duration-200 flex items-center justify-center text-lg",
                          selectedAvatar === avatar.id
                            ? "border-white bg-zinc-800 scale-110"
                            : "border-zinc-800 hover:border-zinc-600 hover:scale-105"
                        )}
                      >
                        {avatar.icon === "user" ? (
                          <User className="h-5 w-5 text-zinc-400" />
                        ) : (
                          <span>{avatar.icon}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleAvatarSave}
                  disabled={uploadingAvatar}
                  className="bg-black hover:bg-zinc-900 text-white font-serif italic text-sm px-8 h-10 rounded-full border border-zinc-800 shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  {uploadingAvatar ? <Loader size="sm" /> : t("settings.avatar.update")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CV Section */}
        <Card id="cv" className="bg-black border-zinc-900 shadow-none">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{t("settings.cv.title")}</CardTitle>
            <CardDescription className="text-[13px] text-zinc-600 font-medium">{t("settings.cv.description")}</CardDescription>
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
                    <p className="text-[11px] font-bold text-white uppercase tracking-[0.2em] animate-pulse">{t("settings.cv.processing")}</p>
                    <p className="text-[12px] text-zinc-600 font-medium italic">{t("settings.cv.processingDescription")}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl w-fit mx-auto group-hover:border-zinc-600 transition-all">
                    <Upload className="h-8 w-8 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[13px] font-bold text-zinc-300 group-hover:text-white transition-colors">
                      {cvFile ? cvFile.name : t("settings.cv.clickToImport")}
                    </p>
                    <p className="text-[11px] font-bold text-zinc-700 uppercase tracking-widest">{t("settings.cv.format")}</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-10 px-8 rounded-full border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-900 text-[11px] font-bold uppercase tracking-widest transition-all">
                    {cvFile ? t("settings.cv.changeFile") : t("settings.cv.selectFile")}
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
              <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{t("settings.skills.title")}</CardTitle>
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
                  placeholder={t("settings.skills.placeholder")}
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
              <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{t("settings.searchPreferences.title")}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{t("settings.searchPreferences.cities")}</label>
                <Input
                  placeholder={t("settings.searchPreferences.citiesPlaceholder")}
                  value={preferredCities}
                  onChange={(e) => setPreferredCities(e.target.value)}
                  className="h-10 bg-zinc-950 border-zinc-900 focus:border-white transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{t("settings.searchPreferences.contractTypes")}</label>
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
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{t("settings.searchPreferences.domains")}</label>
                <Input
                  placeholder={t("settings.searchPreferences.domainsPlaceholder")}
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
              {t("settings.alerts.title")}
            </CardTitle>
            <CardDescription className="text-[13px] text-zinc-600 font-medium">{t("settings.alerts.description")}</CardDescription>
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
                      <span>{alert.locations || t("settings.alerts.global")}</span>
                      <span>{t("settings.alerts.minScore")}: {alert.minMatchScore}%</span>
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
                <p className="text-[13px] font-medium text-zinc-600">{t("settings.alerts.noAlerts")}</p>
              </div>
            )}

            {showAlertForm ? (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-top-4">
                <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">{t("settings.alerts.configuration")}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{t("settings.alerts.name")}</label>
                    <Input
                      placeholder={t("settings.alerts.namePlaceholder")}
                      value={newAlert.name}
                      onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                      className="bg-black border-zinc-900 h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{t("settings.alerts.sectors")}</label>
                    <Input
                      placeholder={t("settings.alerts.sectorsPlaceholder")}
                      value={newAlert.domains}
                      onChange={(e) => setNewAlert({ ...newAlert, domains: e.target.value })}
                      className="bg-black border-zinc-900 h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{t("settings.alerts.locations")}</label>
                    <Input
                      placeholder={t("settings.alerts.locationsPlaceholder")}
                      value={newAlert.locations}
                      onChange={(e) => setNewAlert({ ...newAlert, locations: e.target.value })}
                      className="bg-black border-zinc-900 h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{t("settings.alerts.frequency")}</label>
                    <select
                      value={newAlert.frequency}
                      onChange={(e) => setNewAlert({ ...newAlert, frequency: e.target.value })}
                      className="w-full h-10 px-4 rounded-xl bg-black border border-zinc-900 text-sm font-medium"
                    >
                      <option value="instant">{t("settings.alerts.realtime")}</option>
                      <option value="daily">{t("settings.alerts.daily")}</option>
                      <option value="weekly">{t("settings.alerts.weekly")}</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-zinc-900">
                  <Button onClick={() => setShowAlertForm(false)} variant="ghost" className="h-10 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white rounded-full">{t("settings.alerts.cancel")}</Button>
                  <Button onClick={createAlert} className="flex-1 bg-black hover:bg-zinc-900 text-white font-serif italic text-sm rounded-full border border-zinc-800 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">{t("settings.alerts.enable")}</Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowAlertForm(true)}
                className="w-full h-12 border-zinc-900 bg-black hover:bg-zinc-900 text-zinc-400 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("settings.alerts.addNew")}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Account Controls Section Premium */}
        <Card className="bg-black border-zinc-900 shadow-none border-zinc-800/20">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{t("settings.account.title")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-900 rounded-2xl transition-all hover:border-zinc-800 group">
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-zinc-200 group-hover:text-white">{t("settings.account.export.title")}</p>
                <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">{t("settings.account.export.description")}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportData} className="h-9 px-8 rounded-full border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-widest">{t("settings.account.export.button")}</Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-900 rounded-2xl transition-all hover:border-zinc-800 group">
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-zinc-500 group-hover:text-zinc-200">{t("settings.account.delete.title")}</p>
                <p className="text-[11px] font-medium text-zinc-700 uppercase tracking-wider">{t("settings.account.delete.description")}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDeleteAccount} className="h-9 px-8 rounded-full text-zinc-700 hover:text-white hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-widest transition-all">{t("settings.account.delete.button")}</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            onClick={handleSaveSettings}
            className="bg-black hover:bg-zinc-900 text-white h-12 px-10 rounded-full border border-zinc-800 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] font-serif italic text-base hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="h-4 w-4 mr-3" />
            {t("settings.saveConfig")}
          </Button>
        </div>
      </div>
    </div>
  );
}
