"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus, ArrowRight } from "lucide-react";
import { Loader } from "@/components/ui/loader";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [preferredCities, setPreferredCities] = useState<string[]>([]);
  const [newCity, setNewCity] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les données existantes du profil
  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          // Charger les compétences existantes
          if (data.user.skills && data.user.skills.length > 0) {
            setSkills(data.user.skills.map((s: any) => s.name));
          }
          // Charger les villes existantes
          if (data.user.profile?.preferredCities) {
            const cities = data.user.profile.preferredCities
              .split(",")
              .map((c: string) => c.trim())
              .filter(Boolean);
            setPreferredCities(cities);
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Profile load error:", error);
        setLoading(false);
      });
  }, []);

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addCity = () => {
    if (newCity && !preferredCities.includes(newCity)) {
      setPreferredCities([...preferredCities, newCity]);
      setNewCity("");
    }
  };

  const removeCity = (city: string) => {
    setPreferredCities(preferredCities.filter((c) => c !== city));
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      alert("Format non supporté. Utilisez PDF ou DOCX");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Le fichier doit faire moins de 5MB");
      return;
    }

    setCvFile(file);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/user/cv", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        // Auto-remplir les compétences depuis le CV
        if (data.parsedData?.skills && data.parsedData.skills.length > 0) {
          setSkills((prev) => {
            const newSkills = data.parsedData.skills.filter(
              (s: string) => !prev.includes(s)
            );
            return [...prev, ...newSkills];
          });
        }

        // Auto-remplir les villes depuis le CV
        if (data.parsedData?.cities && data.parsedData.cities.length > 0) {
          setPreferredCities((prev) => {
            const newCities = data.parsedData.cities.filter(
              (c: string) => !prev.includes(c)
            );
            return [...prev, ...newCities];
          });
        }
      } else {
        alert("Erreur lors de l'upload du CV");
      }
    } catch (error) {
      console.error("CV upload error:", error);
      alert("Erreur lors de l'upload du CV");
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = async () => {
    setSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredCities: preferredCities.join(", "),
          skills,
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        alert("Erreur lors de l'enregistrement du profil");
        setSaving(false);
      }
    } catch (error) {
      console.error("Save profile error:", error);
      alert("Erreur lors de l'enregistrement du profil");
      setSaving(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Compléter votre profil</CardTitle>
          <CardDescription>
            Ajoutez vos informations pour un meilleur matching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CV Upload */}
          <div>
            <label className="text-sm font-medium text-zinc-700 block mb-2">
              CV (optionnel)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              className="border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center cursor-pointer hover:border-zinc-400 transition-colors"
              onClick={handleFileSelect}
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader size="sm" />
                  <span className="text-sm text-zinc-500">Analyse du CV...</span>
                </div>
              ) : cvFile ? (
                <div className="flex items-center justify-center gap-2">
                  <Upload className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-zinc-700">{cvFile.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-sm text-zinc-600 mb-1">
                    Glissez votre CV ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-zinc-400">PDF ou DOCX, max 5MB</p>
                </>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Les compétences et villes seront extraites automatiquement
            </p>
          </div>

          {/* Skills */}
          <div>
            <label className="text-sm font-medium text-zinc-700 block mb-2">
              Compétences
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
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
              {skills.length === 0 && (
                <span className="text-sm text-zinc-400">
                  Aucune compétence ajoutée
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter une compétence..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button variant="secondary" onClick={addSkill} type="button">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Cities */}
          <div>
            <label className="text-sm font-medium text-zinc-700 block mb-2">
              Villes de référence
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {preferredCities.map((city) => (
                <Badge key={city} variant="secondary" className="gap-1 pr-1">
                  {city}
                  <button
                    onClick={() => removeCity(city)}
                    className="ml-1 p-0.5 hover:bg-zinc-300 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {preferredCities.length === 0 && (
                <span className="text-sm text-zinc-400">
                  Aucune ville ajoutée
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter une ville..."
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCity())}
              />
              <Button variant="secondary" onClick={addCity} type="button">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={handleSkip} className="flex-1">
              Passer
            </Button>
            <Button onClick={handleContinue} disabled={saving} className="flex-1">
              {saving ? (
                <Loader size="sm" className="mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              Continuer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
