"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import {
  FileText, Upload, Sparkles, CheckCircle2, AlertTriangle,
  Copy, Download, RefreshCw, TrendingUp, Lightbulb, GraduationCap,
  Globe, Zap
} from "lucide-react";

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
  const [cvText, setCvText] = useState("");
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [improvedCV, setImprovedCV] = useState<string | null>(null);
  const [generatedCV, setGeneratedCV] = useState<string | null>(null);
  const [actionVerbs, setActionVerbs] = useState<ActionVerbs | null>(null);
  const [activeTab, setActiveTab] = useState<"analyze" | "improve" | "generate" | "verbs">("analyze");

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
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-amber-500" />
            CV Improver
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {language === "fr" 
              ? "Analysez et améliorez votre CV avec le vocabulaire Harvard"
              : "Analyze and improve your CV with Harvard-style vocabulary"}
          </p>
        </div>
        
        {/* Language Toggle */}
        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setLanguage("fr")}
            className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
              language === "fr" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Globe className="h-3 w-3" />
            FR
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
              language === "en" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Globe className="h-3 w-3" />
            EN
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-700 pb-2">
        {[
          { id: "analyze", icon: TrendingUp, label: language === "fr" ? "Analyser" : "Analyze" },
          { id: "improve", icon: Sparkles, label: language === "fr" ? "Améliorer" : "Improve" },
          { id: "generate", icon: FileText, label: language === "fr" ? "Générer" : "Generate" },
          { id: "verbs", icon: Lightbulb, label: language === "fr" ? "Verbes d'action" : "Action Verbs" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-zinc-800 text-white border-b-2 border-amber-500"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Analyze Tab */}
      {activeTab === "analyze" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-zinc-700">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4 text-blue-500" />
                {language === "fr" ? "Votre CV" : "Your CV"}
              </CardTitle>
              <CardDescription>
                {language === "fr" 
                  ? "Collez le contenu de votre CV pour l'analyser"
                  : "Paste your CV content to analyze it"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={language === "fr" 
                  ? "Collez le contenu de votre CV ici..."
                  : "Paste your CV content here..."}
                value={cvText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCvText(e.target.value)}
                rows={15}
                className="bg-zinc-900 text-sm"
              />
              <Button onClick={analyzeCV} disabled={loading || !cvText.trim()} className="w-full">
                {loading ? <Loader size="sm" className="mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                {language === "fr" ? "Analyser mon CV" : "Analyze my CV"}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card className="border-zinc-700">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {language === "fr" ? "Résultats de l'analyse" : "Analysis Results"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div className="space-y-6">
                  {/* Score */}
                  <div className="text-center p-4 bg-zinc-800 rounded-lg">
                    <p className="text-sm text-zinc-400 mb-2">
                      {language === "fr" ? "Score de votre CV" : "CV Score"}
                    </p>
                    <p className={`text-5xl font-bold ${getScoreColor(analysis.score)}`}>
                      {analysis.score}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">/100</p>
                  </div>

                  {/* Strengths */}
                  {analysis.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {language === "fr" ? "Points forts" : "Strengths"}
                      </h4>
                      <ul className="space-y-1">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                            <span className="text-green-500">✓</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {analysis.weaknesses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-orange-400 mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {language === "fr" ? "Points à améliorer" : "Areas to Improve"}
                      </h4>
                      <ul className="space-y-1">
                        {analysis.weaknesses.map((w, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                            <span className="text-orange-500">!</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {analysis.suggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" />
                        {language === "fr" ? "Suggestions" : "Suggestions"}
                      </h4>
                      <div className="space-y-2">
                        {analysis.suggestions.map((s, i) => (
                          <div key={i} className="p-2 bg-zinc-800 rounded text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-[10px]">{s.category}</Badge>
                            </div>
                            <p className="text-zinc-500 line-through">{s.original}</p>
                            <p className="text-green-400">→ {s.improved}</p>
                            <p className="text-zinc-400 mt-1 italic">{s.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{language === "fr" ? "Collez votre CV pour obtenir une analyse" : "Paste your CV to get an analysis"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Improve Tab */}
      {activeTab === "improve" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-zinc-700">
            <CardHeader>
              <CardTitle className="text-base">
                {language === "fr" ? "CV Original" : "Original CV"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={language === "fr" 
                  ? "Collez votre CV ici..."
                  : "Paste your CV here..."}
                value={cvText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCvText(e.target.value)}
                rows={20}
                className="bg-zinc-900 text-sm font-mono"
              />
              <Button onClick={improveCV} disabled={loading || !cvText.trim()} className="w-full bg-amber-600 hover:bg-amber-500">
                {loading ? <Loader size="sm" className="mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {language === "fr" ? "Améliorer avec vocabulaire Harvard" : "Improve with Harvard vocabulary"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-zinc-700 border-amber-500/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-amber-500" />
                {language === "fr" ? "CV Amélioré" : "Improved CV"}
              </CardTitle>
              {improvedCV && (
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(improvedCV)}>
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {improvedCV ? (
                <Textarea
                  value={improvedCV}
                  readOnly
                  rows={20}
                  className="bg-zinc-900 text-sm font-mono text-green-300"
                />
              ) : (
                <div className="text-center py-20 text-zinc-500">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{language === "fr" ? "Votre CV amélioré apparaîtra ici" : "Your improved CV will appear here"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generate Tab */}
      {activeTab === "generate" && (
        <div className="max-w-4xl mx-auto">
          <Card className="border-zinc-700">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <GraduationCap className="h-5 w-5 text-amber-500" />
                {language === "fr" ? "Générer un CV Harvard" : "Generate Harvard CV"}
              </CardTitle>
              <CardDescription>
                {language === "fr"
                  ? "Créez un CV professionnel basé sur votre profil avec le vocabulaire Harvard"
                  : "Create a professional CV based on your profile with Harvard vocabulary"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateCV} disabled={loading} className="w-full bg-amber-600 hover:bg-amber-500">
                {loading ? <Loader size="sm" className="mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                {language === "fr" ? "Générer mon CV Harvard" : "Generate my Harvard CV"}
              </Button>

              {generatedCV && (
                <div className="relative">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedCV)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={generatedCV}
                    readOnly
                    rows={25}
                    className="bg-zinc-900 text-sm font-mono"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Verbs Tab */}
      {activeTab === "verbs" && actionVerbs && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(actionVerbs).map(([category, verbs]) => (
            <Card key={category} className="border-zinc-700">
              <CardHeader>
                <CardTitle className="text-sm capitalize flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  {category === "leadership" ? (language === "fr" ? "Leadership" : "Leadership") :
                   category === "achievement" ? (language === "fr" ? "Accomplissement" : "Achievement") :
                   category === "analysis" ? (language === "fr" ? "Analyse" : "Analysis") :
                   category === "communication" ? (language === "fr" ? "Communication" : "Communication") :
                   category === "creation" ? (language === "fr" ? "Création" : "Creation") :
                   (language === "fr" ? "Amélioration" : "Improvement")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(verbs as string[]).map((verb) => (
                    <Badge
                      key={verb}
                      variant="secondary"
                      className="cursor-pointer hover:bg-amber-600 hover:text-white transition-colors"
                      onClick={() => copyToClipboard(verb)}
                    >
                      {verb}
                    </Badge>
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
