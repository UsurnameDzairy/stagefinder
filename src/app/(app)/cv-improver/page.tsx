"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import {
  FileText, Upload, Sparkles, CheckCircle2, AlertTriangle,
  Copy, Download, RefreshCw, TrendingUp, Lightbulb,
  Zap
} from "lucide-react";

import { useTranslation, useLanguage } from "@/lib/i18n";

interface CVAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: {
    category: string;
    original: string;
    improved: string;
    reason: string;
  }[];
}

interface ActionVerbs {
  leadership: string[];
  achievement: string[];
  analysis: string[];
  communication: string[];
  creation: string[];
  improvement: string[];
}

export default function CVImproverPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [cvText, setCvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [improvedCV, setImprovedCV] = useState<string | null>(null);
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);
  const [actionVerbs, setActionVerbs] = useState<ActionVerbs | null>(null);
  const [activeTab, setActiveTab] = useState<"analyze" | "improve" | "generate" | "verbs">("analyze");

  // Upload CV file (PDF) - also saves to database so Kam can access it
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt') && !file.name.endsWith('.docx')) {
      alert(t("applications.cvUpload.unsupportedFormat") || "Unsupported format. Use PDF, TXT or DOCX.");
      return;
    }

    setUploading(true);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // First, extract the text for display
      const parseRes = await fetch('/api/cv/parse', {
        method: 'POST',
        body: formData,
      });

      const parseData = await parseRes.json();

      if (parseData.success && parseData.text) {
        setCvText(parseData.text);

        // Also save to database so Kam can access it later
        // Create a new FormData for the user CV endpoint
        const saveFormData = new FormData();
        saveFormData.append('file', file);

        try {
          await fetch('/api/user/cv', {
            method: 'POST',
            body: saveFormData,
          });
          // Silent save - don't block the user experience if save fails
          console.log("CV saved to database for Kam access");
        } catch (saveError) {
          console.error("Failed to save CV to database:", saveError);
          // Continue anyway - the main functionality (text extraction) worked
        }
      } else {
        alert(parseData.error || t("applications.cvUpload.errorReading") || "Error reading file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(t("applications.cvUpload.errorUploading") || "Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions();
  }, [language]);

  const loadSuggestions = async () => {
    try {
      const res = await fetch(`/api/generate/cv-improve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggestions", language }),
      });
      const data = await res.json();
      if (data.actionVerbs) {
        setActionVerbs(data.actionVerbs);
      }
    } catch (error) {
      console.error("Error loading suggestions:", error);
    }
  };

  const analyzeCV = async () => {
    if (!cvText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate/cv-improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze", cvText, language }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Error analyzing CV:", error);
    } finally {
      setLoading(false);
    }
  };

  const improveCV = async () => {
    if (!cvText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate/cv-improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "improve", cvText, language }),
      });
      const data = await res.json();
      if (data.improvedCV) {
        setImprovedCV(data.improvedCV);
        if (data.analysis) {
          setAnalysis(data.analysis);
        }
      }
    } catch (error) {
      console.error("Error improving CV:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCV = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate/cv-improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", language }),
      });
      const data = await res.json();
      if (data.generatedCV) {
        setGeneratedCV(data.generatedCV);
      }
    } catch (error) {
      console.error("Error generating CV:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-white";
    if (score >= 60) return "text-zinc-300";
    if (score >= 40) return "text-zinc-500";
    return "text-zinc-700";
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-serif font-normal tracking-tight text-white">
            {t("cvImprover.title")}
          </h1>
          <p className="text-[13px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
            {t("cvImprover.subtitle")}
          </p>
        </div>
      </div>

      {/* Tabs Premium */}
      <div className="flex gap-1 p-1 bg-zinc-950/50 border border-zinc-900 rounded-2xl w-fit">
        {[
          { id: "analyze", icon: TrendingUp, label: t("cvImprover.tabs.analyze") },
          { id: "improve", icon: Sparkles, label: t("cvImprover.tabs.improve") },
          { id: "generate", icon: FileText, label: t("cvImprover.tabs.generate") },
          { id: "verbs", icon: Lightbulb, label: t("cvImprover.tabs.verbs") },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-white text-black shadow-lg"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Analyze Tab */}
      {activeTab === "analyze" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-black border-zinc-900 shadow-none">
            <CardHeader className="p-6">
              <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
                <Upload className="h-4 w-4 text-zinc-400" />
                {t("cvImprover.yourCv")}
              </CardTitle>
              <CardDescription className="text-[13px] text-zinc-600 font-medium">
                {t("cvImprover.uploadOrPaste")}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-6">
              {/* Upload Zone Premium */}
              <div className="border-2 border-dashed border-zinc-900 hover:border-zinc-700 bg-zinc-950/30 rounded-2xl p-8 text-center transition-all duration-300 group cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={uploading}
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader size="sm" />
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
                      {t("cvImprover.reading")}
                    </span>
                  </div>
                ) : uploadedFileName ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-white rounded-xl shadow-xl">
                      <FileText className="h-6 w-6 text-black" />
                    </div>
                    <span className="text-[13px] font-bold text-zinc-200 tracking-tight">{uploadedFileName}</span>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">
                      {t("cvImprover.changeFile")}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl group-hover:border-zinc-600 transition-all">
                      <Upload className="h-6 w-6 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                    <span className="text-[13px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      {t("cvImprover.selectFile")}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">PDF, TXT, DOCX</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-zinc-900" />
                <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">
                  {t("cvImprover.orRawText")}
                </span>
                <div className="flex-1 h-px bg-zinc-900" />
              </div>

              <Textarea
                placeholder={t("cvImprover.pastePlaceholder")}
                value={cvText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCvText(e.target.value)}
                rows={10}
                className="bg-zinc-950 border-zinc-900 text-[13px] font-medium leading-relaxed p-4 focus:border-zinc-700 transition-all scrollbar-hide"
              />
              <Button
                onClick={analyzeCV}
                disabled={loading || !cvText.trim()}
                className="w-full bg-black hover:bg-zinc-900 text-white font-serif italic text-base h-12 rounded-full border border-zinc-800 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? <Loader size="sm" /> : <TrendingUp className="h-4 w-4 mr-3 text-zinc-400" />}
                {t("cvImprover.startAnalysis")}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results Premium */}
          <Card className="bg-black border-zinc-900 shadow-none overflow-hidden">
            <CardHeader className="p-6">
              <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-zinc-400" />
                {t("cvImprover.intelligenceReport")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {analysis ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {/* Score Premium */}
                  <div className="relative p-8 bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                      <Sparkles className="h-24 w-24 text-white" />
                    </div>
                    <div className="text-center relative z-10">
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-4">
                        {t("cvImprover.harvardScore")}
                      </p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className={cn("text-7xl font-bold tracking-tighter", getScoreColor(analysis.score))}>
                          {analysis.score}
                        </span>
                        <span className="text-zinc-700 font-bold text-xl">/100</span>
                      </div>
                      <div className="mt-6 h-1 bg-zinc-900 rounded-full w-48 mx-auto overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-1000", 
                            analysis.score >= 80 ? "bg-white" : 
                            analysis.score >= 60 ? "bg-zinc-400" : "bg-zinc-700"
                          )} 
                          style={{ width: `${analysis.score}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="grid grid-cols-1 gap-6">
                    {analysis.strengths.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                          {t("cvImprover.strengths")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.strengths.map((s, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-[12px] font-medium text-zinc-300">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {analysis.weaknesses.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                          {t("cvImprover.weaknesses")}
                        </h4>
                        <div className="space-y-2">
                          {analysis.weaknesses.map((w, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-zinc-950/50 border border-zinc-900 rounded-xl">
                              <AlertTriangle className="h-3.5 w-3.5 text-zinc-600 mt-0.5" />
                              <span className="text-[12px] font-medium text-zinc-400 leading-relaxed">{w}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggestions Premium */}
                  {analysis.suggestions.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-zinc-900">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{t("cvImprover.harvardRecommendations")}</h4>
                      <div className="space-y-3">
                        {analysis.suggestions.map((s, i) => (
                          <div key={i} className="group p-4 bg-zinc-950 border border-zinc-900 rounded-2xl hover:border-zinc-700 transition-all">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-zinc-900 text-zinc-500 border border-zinc-800">
                                {s.category}
                              </span>
                            </div>
                            <div className="space-y-2 mb-3">
                              <p className="text-[11px] font-medium text-zinc-600 line-through decoration-zinc-800">{s.original}</p>
                              <div className="flex items-start gap-2">
                                <span className="text-white mt-0.5">→</span>
                                <p className="text-[13px] font-bold text-zinc-100 tracking-tight">{s.improved}</p>
                              </div>
                            </div>
                            <p className="text-[11px] font-medium text-zinc-500 italic leading-relaxed">{s.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-32 space-y-6">
                  <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-full w-fit mx-auto opacity-20">
                    <TrendingUp className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-[13px] font-medium text-zinc-600 max-w-[240px] mx-auto leading-relaxed">
                    {t("cvImprover.awaitingData")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Improve Tab */}
      {activeTab === "improve" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
          <Card className="bg-black border-zinc-900 shadow-none">
            <CardHeader className="p-6">
              <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                {t("cvImprover.originalCv")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-6">
              <Textarea
                placeholder={t("cvImprover.pastePlaceholder")}
                value={cvText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCvText(e.target.value)}
                rows={18}
                className="bg-zinc-950 border-zinc-900 text-[13px] font-mono leading-relaxed p-4 focus:border-zinc-700 transition-all scrollbar-hide"
              />
              <Button
                onClick={improveCV}
                disabled={loading || !cvText.trim()}
                className="w-full bg-black hover:bg-zinc-900 text-white font-serif italic text-base h-12 rounded-full border border-zinc-800 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? <Loader size="sm" /> : <Sparkles className="h-4 w-4 mr-3 text-zinc-400" />}
                {t("cvImprover.improveWithAi")}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black border-zinc-900 shadow-none border-zinc-800/50">
            <CardHeader className="p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-zinc-400" />
                {t("cvImprover.optimizedResult")}
              </CardTitle>
              {improvedCV && (
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(improvedCV)} className="h-8 text-zinc-500 hover:text-white hover:bg-zinc-900">
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Copy</span>
                </Button>
              )}
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {improvedCV ? (
                <Textarea
                  value={improvedCV}
                  readOnly
                  rows={18}
                  className="bg-zinc-950 border-zinc-900 text-[13px] font-mono text-zinc-200 leading-relaxed p-4 scrollbar-hide"
                />
              ) : (
                <div className="text-center py-32 space-y-6">
                  <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-full w-fit mx-auto opacity-20">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-[13px] font-medium text-zinc-600 max-w-[240px] mx-auto leading-relaxed">
                    {t("cvImprover.optimizedWillAppear")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generate Tab */}
      {activeTab === "generate" && (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
          <Card className="bg-black border-zinc-900 shadow-none">
            <CardHeader className="p-8 text-center">
              <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-full w-fit mx-auto mb-6">
                <FileText className="h-8 w-8 text-zinc-400" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-white mb-2">
                {t("cvImprover.generateHarvardCv")}
              </CardTitle>
              <CardDescription className="text-[13px] text-zinc-500 font-medium max-w-sm mx-auto">
                {t("cvImprover.generateDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-8">
              <Button
                onClick={generateCV}
                disabled={loading}
                className="w-full bg-black hover:bg-zinc-900 text-white font-serif italic text-base h-12 rounded-full border border-zinc-800 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? <Loader size="sm" /> : <FileText className="h-4 w-4 mr-3 text-zinc-400" />}
                {t("cvImprover.generatePremiumCv")}
              </Button>

              {generatedCV && (
                <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedCV)} className="h-9 border-zinc-800 bg-zinc-950/80 backdrop-blur text-zinc-400 hover:text-white">
                      <Copy className="h-3.5 w-3.5 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={generatedCV}
                    readOnly
                    rows={22}
                    className="bg-zinc-950 border-zinc-900 text-[13px] font-mono leading-relaxed p-8 focus:border-zinc-700 transition-all scrollbar-hide"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Verbs Tab */}
      {activeTab === "verbs" && actionVerbs && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {Object.entries(actionVerbs).map(([category, verbs]) => (
            <Card key={category} className="bg-black border-zinc-900 shadow-none group hover:border-zinc-700 transition-all duration-300">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
                  <Zap className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  {t(`cvImprover.verbCategories.${category}`)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-4">
                <div className="flex flex-wrap gap-1.5">
                  {(verbs as string[]).map((verb) => (
                    <button
                      key={verb}
                      onClick={() => copyToClipboard(verb)}
                      className="px-2.5 py-1 rounded-md bg-zinc-900/50 border border-zinc-900 text-[11px] font-medium text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-900 transition-all"
                    >
                      {verb}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
