"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus, Save, Trash2, Bell, BellRing, ToggleLeft, ToggleRight, Zap } from "lucide-react";

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
    <div className="space-y-6 max-w-3xl pb-24">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Parametres</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Gerez votre profil et vos preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Avatar</CardTitle>
          <CardDescription>
            Personnalisez votre profil avec un avatar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="URL de votre avatar (ex: https://i.imgur.com/...)"
              disabled={uploadingAvatar}
            />
            <Button 
              onClick={handleAvatarUrlSubmit} 
              disabled={uploadingAvatar || !avatarUrl.trim()}
            >
              {uploadingAvatar ? "..." : "Mettre à jour"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRemoveAvatar}
              disabled={uploadingAvatar}
            >
              Supprimer l'avatar
            </Button>
          </div>
          <p className="text-xs text-zinc-500">
            Utilisez une URL d'image (JPEG, PNG, GIF). Recommandé: 200x200px
          </p>
        </CardContent>
      </Card>

      <Card id="cv">
        <CardHeader>
          <CardTitle className="text-base">CV</CardTitle>
          <CardDescription>
            Importez votre CV pour ameliorer le matching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center">
            {uploadingCv ? (
              <>
                <div className="h-8 w-8 border-2 border-zinc-400 border-t-zinc-100 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-zinc-300 mb-2">Analyse du CV en cours...</p>
                <p className="text-xs text-zinc-500">Extraction des compétences et informations</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-3" />
                <p className="text-sm text-zinc-300 mb-2">
                  {cvFile ? `Fichier: ${cvFile.name}` : "Glissez votre CV ici ou cliquez pour sélectionner"}
                </p>
                <p className="text-xs text-zinc-500 mb-4">PDF ou DOCX, max 5MB</p>
                <Button variant="secondary" size="sm" onClick={handleFileSelect}>
                  {cvFile ? "Changer de fichier" : "Sélectionner un fichier"}
                </Button>
              </>
            )}
          </div>
          {cvStatus && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              cvStatus.includes("✅") ? "bg-green-900/30 text-green-300" :
              cvStatus.includes("⚠️") ? "bg-yellow-900/30 text-yellow-300" :
              cvStatus.includes("❌") ? "bg-red-900/30 text-red-300" :
              "bg-zinc-800 text-zinc-300"
            }`}>
              {cvStatus}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Competences</CardTitle>
          <CardDescription>
            Ajoutez vos competences pour un meilleur matching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-1 p-0.5 hover:bg-zinc-300 rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter une competence..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
            />
            <Button variant="secondary" onClick={addSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences de recherche</CardTitle>
          <CardDescription>
            Configurez vos criteres de recherche par defaut
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 block mb-1.5">
              Villes preferees
            </label>
            <Input
              placeholder="Paris, Lyon, Bordeaux..."
              value={preferredCities}
              onChange={(e) => setPreferredCities(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 block mb-1.5">
              Types de contrat
            </label>
            <div className="flex gap-2">
              {["stage", "alternance", "cdi", "cdd"].map((type) => (
                <button
                  key={type}
                  onClick={() => toggleContractType(type)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                    contractTypes.includes(type)
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 block mb-1.5">
              Domaines d'interet
            </label>
            <Input
              placeholder="Tech, Finance, Marketing..."
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section Alertes */}
      <Card id="alerts">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BellRing className="h-4 w-4 text-yellow-500" />
            Alertes emploi
          </CardTitle>
          <CardDescription>
            Recevez des notifications quand une offre correspond à vos critères
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Liste des alertes */}
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.isActive ? "border-green-500/30 bg-green-500/5" : "border-zinc-700 bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-zinc-100">{alert.name}</h4>
                        {alert.isActive ? (
                          <Badge className="bg-green-500/20 text-green-400 text-[10px]">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {alert.domains.split(",").map((d) => (
                          <Badge key={d} variant="outline" className="text-[10px]">
                            {d.trim()}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        {alert.locations || "Toutes localisations"} • Score min: {alert.minMatchScore}% • {alert.frequency === "instant" ? "Instantané" : alert.frequency === "daily" ? "Quotidien" : "Hebdomadaire"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAlert(alert.id, alert.isActive)}
                        className="p-1.5 rounded hover:bg-zinc-700"
                        title={alert.isActive ? "Désactiver" : "Activer"}
                      >
                        {alert.isActive ? (
                          <ToggleRight className="h-5 w-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-zinc-500" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-zinc-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune alerte configurée</p>
              <p className="text-xs">Créez une alerte pour être notifié des nouvelles opportunités</p>
            </div>
          )}

          {/* Formulaire nouvelle alerte */}
          {showAlertForm ? (
            <div className="border border-zinc-700 rounded-lg p-4 space-y-3 bg-zinc-800/50">
              <h4 className="font-medium text-zinc-200 text-sm">Nouvelle alerte</h4>
              
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nom de l'alerte *</label>
                <Input
                  placeholder="Ex: Stage Finance Paris"
                  value={newAlert.name}
                  onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                  className="bg-zinc-900"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Domaines * (séparés par des virgules)</label>
                <Input
                  placeholder="Finance, Tech, Marketing..."
                  value={newAlert.domains}
                  onChange={(e) => setNewAlert({ ...newAlert, domains: e.target.value })}
                  className="bg-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Mots-clés</label>
                  <Input
                    placeholder="React, Python..."
                    value={newAlert.keywords}
                    onChange={(e) => setNewAlert({ ...newAlert, keywords: e.target.value })}
                    className="bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Localisations</label>
                  <Input
                    placeholder="Paris, Lyon..."
                    value={newAlert.locations}
                    onChange={(e) => setNewAlert({ ...newAlert, locations: e.target.value })}
                    className="bg-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Score minimum (%)</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={newAlert.minMatchScore}
                    onChange={(e) => setNewAlert({ ...newAlert, minMatchScore: parseInt(e.target.value) || 50 })}
                    className="bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Fréquence</label>
                  <select
                    value={newAlert.frequency}
                    onChange={(e) => setNewAlert({ ...newAlert, frequency: e.target.value })}
                    className="w-full h-9 px-3 rounded-md bg-zinc-900 border border-zinc-700 text-sm text-zinc-100"
                  >
                    <option value="instant">Instantané</option>
                    <option value="daily">Quotidien</option>
                    <option value="weekly">Hebdomadaire</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={createAlert} size="sm" className="flex-1">
                  <Plus className="h-4 w-4 mr-1" />
                  Créer l'alerte
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowAlertForm(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setShowAlertForm(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer une alerte
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Section Scraping Automatique */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Scraping Automatique
          </CardTitle>
          <CardDescription>
            Recevez automatiquement les nouvelles offres correspondant à votre profil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-sm font-medium text-blue-400 mb-2">Comment ça marche ?</h4>
            <ul className="text-xs text-zinc-400 space-y-1">
              <li>• Le système scrape automatiquement toutes les 2 heures</li>
              <li>• Recherche basée sur vos domaines, villes et types de contrat</li>
              <li>• Notifications instantanées pour chaque nouvelle offre</li>
              <li>• 100% données réelles (LinkedIn, Indeed, HelloWork, WTTJ)</li>
            </ul>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-zinc-700">
            <div>
              <p className="text-sm font-medium text-zinc-100">Déclencher maintenant</p>
              <p className="text-xs text-zinc-400">Lance une recherche immédiate pour votre profil</p>
            </div>
            <Button 
              variant="default" 
              size="sm" 
              onClick={async () => {
                try {
                  const response = await fetch('/api/cron/auto-scrape', {
                    method: 'POST',
                  });
                  const data = await response.json();
                  if (response.ok) {
                    alert('✅ ' + data.message);
                  } else {
                    alert('❌ Erreur: ' + (data.error || 'Erreur inconnue'));
                  }
                } catch (error) {
                  alert('❌ Erreur réseau');
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Zap className="h-4 w-4 mr-1" />
              Lancer
            </Button>
          </div>

          <div className="text-xs text-zinc-500">
            <p className="mb-1">📋 <strong>Profil actuel:</strong></p>
            {domains && <p>• Domaines: {domains}</p>}
            {preferredCities && <p>• Villes: {preferredCities}</p>}
            {contractTypes.length > 0 && <p>• Contrats: {contractTypes.join(', ')}</p>}
            {skills.length > 0 && <p>• Compétences: {skills.slice(0, 3).join(', ')}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compte</CardTitle>
          <CardDescription>
            Gerez les parametres de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="text-sm font-medium text-zinc-100">Exporter mes donnees</p>
              <p className="text-xs text-zinc-400">Telecharger toutes vos donnees (RGPD)</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExportData}>Exporter</Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-red-400">Supprimer mon compte</p>
              <p className="text-xs text-zinc-400">Cette action est irreversible</p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
}
