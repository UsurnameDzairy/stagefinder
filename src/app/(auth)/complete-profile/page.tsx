"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus, ArrowRight, Sparkles } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { Logo } from "@/components/ui/logo";

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

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          if (data.user.skills && data.user.skills.length > 0) {
            setSkills(data.user.skills.map((s: any) => s.name));
          }
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
      alert("Unsupported format. Use PDF or DOCX");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File must be less than 5MB");
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

        if (data.parsedData?.skills && data.parsedData.skills.length > 0) {
          setSkills((prev) => {
            const newSkills = data.parsedData.skills.filter(
              (s: string) => !prev.includes(s)
            );
            return [...prev, ...newSkills];
          });
        }

        if (data.parsedData?.cities && data.parsedData.cities.length > 0) {
          setPreferredCities((prev) => {
            const newCities = data.parsedData.cities.filter(
              (c: string) => !prev.includes(c)
            );
            return [...prev, ...newCities];
          });
        }
      } else {
        alert("Error uploading CV");
      }
    } catch (error) {
      console.error("CV upload error:", error);
      alert("Error uploading CV");
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
        alert("Error saving profile");
        setSaving(false);
      }
    } catch (error) {
      console.error("Save profile error:", error);
      alert("Error saving profile");
      setSaving(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12 relative overflow-hidden font-sans text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
      <div className="absolute top-1/4 right-1/4 size-64 bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 size-96 bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="flex items-center justify-center gap-2 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Logo size={24} />
        </div>

        <Card className="bg-black border-zinc-900 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <CardHeader className="pt-12 pb-8 text-center space-y-2">
            <h1 className="font-serif text-4xl font-normal tracking-tight text-white">Strategic Profile</h1>
            <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Initializing matching parameters</p>
          </CardHeader>
          <CardContent className="px-8 pb-12 space-y-10">
            {/* CV Upload Premium */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                Trajectory Import (CV)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                className="border-2 border-dashed border-zinc-900 hover:border-zinc-700 bg-zinc-950/30 rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 group"
                onClick={handleFileSelect}
              >
                {uploading ? (
                  <div className="space-y-3">
                    <Loader size="sm" className="mx-auto" />
                    <p className="text-[11px] font-bold text-white uppercase tracking-widest animate-pulse">Extraction Intelligence Engine...</p>
                  </div>
                ) : cvFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                      <Upload className="h-5 w-5 text-black" />
                    </div>
                    <span className="text-sm font-bold text-zinc-200 tracking-tight">{cvFile.name}</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl w-fit mx-auto group-hover:border-zinc-600 transition-all">
                      <Upload className="h-6 w-6 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[13px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">Drop your CV for AI extraction</p>
                      <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">PDF ou DOCX (Max 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-zinc-900/50">
              {/* Skills Premium */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Detected Skills</label>
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all group">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="text-zinc-700 hover:text-white transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <span className="text-[11px] font-medium text-zinc-700 italic uppercase tracking-wider mt-2">No items</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: React, Marketing..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    className="h-10 bg-zinc-950 border-zinc-900 focus:border-white transition-all text-xs rounded-xl"
                  />
                  <Button variant="outline" onClick={addSkill} type="button" className="h-10 w-10 p-0 border-zinc-800 bg-black text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl transition-all shadow-lg active:scale-90">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Cities Premium */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Reference Cities</label>
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {preferredCities.map((city) => (
                    <span key={city} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all group">
                      {city}
                      <button onClick={() => removeCity(city)} className="text-zinc-700 hover:text-white transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {preferredCities.length === 0 && (
                    <span className="text-[11px] font-medium text-zinc-700 italic uppercase tracking-wider mt-2">Global / Remote</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: Paris, Lyon..."
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCity())}
                    className="h-10 bg-zinc-950 border-zinc-900 focus:border-white transition-all text-xs rounded-xl"
                  />
                  <Button variant="outline" onClick={addCity} type="button" className="h-10 w-10 p-0 border-zinc-800 bg-black text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl transition-all shadow-lg active:scale-90">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions Premium */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-zinc-900/50">
              <Button 
                variant="ghost" 
                onClick={handleSkip} 
                className="flex-1 h-12 text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] hover:text-white hover:bg-white/[0.03] rounded-xl transition-all"
              >
                Skip this step
              </Button>
              <Button 
                onClick={handleContinue} 
                disabled={saving} 
                className="flex-[2] bg-black hover:bg-zinc-900 text-white h-12 font-serif italic text-base rounded-xl border border-zinc-800 transition-all shadow-[0_0_40px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-[0.98]"
              >
                {saving ? <Loader size="sm" /> : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-3 text-zinc-400" />
                    Initialize Dashboard
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

