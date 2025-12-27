"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, Calendar, FileText, MoreHorizontal, Plus, Mail, 
  MessageSquare, CheckCircle2, XCircle, Clock, TrendingUp,
  Copy, Download, Image, ChevronDown, ChevronUp, Sparkles,
  Building2, ExternalLink
} from "lucide-react";
import { ProgressTracker, MiniProgressTracker } from "@/components/applications/progress-tracker";
import { Loader } from "@/components/ui/loader";

interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  status: string;
  appliedAt: string | null;
  emailSent: boolean;
  emailSentAt: string | null;
  responseReceived: boolean;
  responseReceivedAt: string | null;
  responseType: string | null;
  interviewAt: string | null;
  contactEmail: string | null;
  notes: string | null;
  matchScore: number | null;
  companyUrl: string | null;
  timeline: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    createdAt: string;
  }>;
}

interface Stats {
  total: number;
  applied: number;
  inProgress: number;
  interview: number;
  offer: number;
  rejected: number;
  pending: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NOT_APPLIED: { label: "Non postulé", color: "bg-zinc-700 text-zinc-300" },
  APPLIED: { label: "Postulé", color: "bg-green-900/50 text-green-300" },
  IN_PROGRESS: { label: "En cours", color: "bg-amber-900/50 text-amber-300" },
  INTERVIEW: { label: "Entretien", color: "bg-blue-900/50 text-blue-300" },
  OFFER: { label: "Offre reçue", color: "bg-emerald-900/50 text-emerald-300" },
  REJECTED: { label: "Refusé", color: "bg-red-900/50 text-red-300" },
  WITHDRAWN: { label: "Retiré", color: "bg-zinc-700 text-zinc-400" },
};

export default function CandidaturesPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEmailGenerator, setShowEmailGenerator] = useState<string | null>(null);
  const [showCoverLetterGenerator, setShowCoverLetterGenerator] = useState<string | null>(null);
  const [showResponseForm, setShowResponseForm] = useState<string | null>(null);
  
  // Form states
  const [newApp, setNewApp] = useState({ companyName: "", jobTitle: "", contactEmail: "", companyUrl: "" });
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null);
  const [emailType, setEmailType] = useState<"application" | "followUp" | "thankYou">("application");
  const [coverLetterTone, setCoverLetterTone] = useState<"formal" | "dynamic" | "creative" | "harvard">("harvard");
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [responseData, setResponseData] = useState({ type: "pending", content: "", screenshot: null as File | null });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      setApplications(data.applications || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async () => {
    if (!newApp.companyName || !newApp.jobTitle) return;
    
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newApp),
      });
      
      if (res.ok) {
        setShowNewForm(false);
        setNewApp({ companyName: "", jobTitle: "", contactEmail: "", companyUrl: "" });
        fetchApplications();
      }
    } catch (error) {
      console.error("Error creating application:", error);
    }
  };

  const generateEmail = async (appId: string, app: Application) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: emailType,
          companyName: app.companyName,
          jobTitle: app.jobTitle,
          appliedDate: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("fr-FR") : undefined,
        }),
      });
      
      const data = await res.json();
      if (data.email) {
        setGeneratedEmail({ subject: data.email.subject, body: data.email.body });
      }
    } catch (error) {
      console.error("Error generating email:", error);
    } finally {
      setGenerating(false);
    }
  };

  const generateCoverLetter = async (app: Application) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: app.companyName,
          jobTitle: app.jobTitle,
          tone: coverLetterTone,
          language: language,
        }),
      });
      
      const data = await res.json();
      if (data.coverLetter) {
        setGeneratedCoverLetter(data.coverLetter.content);
      }
    } catch (error) {
      console.error("Error generating cover letter:", error);
    } finally {
      setGenerating(false);
    }
  };

  const markEmailSent = async (appId: string) => {
    try {
      await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          emailSent: true, 
          emailContent: generatedEmail?.body 
        }),
      });
      fetchApplications();
      setShowEmailGenerator(null);
      setGeneratedEmail(null);
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  const submitResponse = async (appId: string) => {
    try {
      const formData = new FormData();
      
      const updateData: Record<string, unknown> = {
        responseReceived: true,
        responseType: responseData.type,
        responseContent: responseData.content,
      };

      // Upload screenshot if provided
      if (responseData.screenshot) {
        const screenshotData = new FormData();
        screenshotData.append("file", responseData.screenshot);
        // For now, we'll skip screenshot upload - would need a separate endpoint
      }

      await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      fetchApplications();
      setShowResponseForm(null);
      setResponseData({ type: "pending", content: "", screenshot: null });
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-500" />
            Suivi Candidatures
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gérez vos candidatures et suivez leur progression
          </p>
        </div>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle candidature
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-zinc-100">{stats.total}</p>
              <p className="text-xs text-zinc-500">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-green-900/20 border-green-800/50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{stats.applied}</p>
              <p className="text-xs text-green-500">Postulées</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-900/20 border-amber-800/50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
              <p className="text-xs text-amber-500">En attente</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-900/20 border-blue-800/50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.interview}</p>
              <p className="text-xs text-blue-500">Entretiens</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-900/20 border-emerald-800/50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{stats.offer}</p>
              <p className="text-xs text-emerald-500">Offres</p>
            </CardContent>
          </Card>
          <Card className="bg-red-900/20 border-red-800/50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
              <p className="text-xs text-red-500">Refusées</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-900/20 border-purple-800/50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">
                {stats.total > 0 ? Math.round((stats.interview + stats.offer) / stats.total * 100) : 0}%
              </p>
              <p className="text-xs text-purple-500">Taux succès</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Application Form */}
      {showNewForm && (
        <Card className="border-blue-500/50 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-base">Nouvelle candidature</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Entreprise *</label>
                <Input
                  placeholder="Nom de l'entreprise"
                  value={newApp.companyName}
                  onChange={(e) => setNewApp({ ...newApp, companyName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Poste *</label>
                <Input
                  placeholder="Titre du poste"
                  value={newApp.jobTitle}
                  onChange={(e) => setNewApp({ ...newApp, jobTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Email contact</label>
                <Input
                  type="email"
                  placeholder="recrutement@entreprise.com"
                  value={newApp.contactEmail}
                  onChange={(e) => setNewApp({ ...newApp, contactEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Site carrière</label>
                <Input
                  placeholder="https://..."
                  value={newApp.companyUrl}
                  onChange={(e) => setNewApp({ ...newApp, companyUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowNewForm(false)}>Annuler</Button>
              <Button onClick={createApplication}>Créer</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card className="border-zinc-700">
          <CardContent className="py-12 text-center">
            <Send className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 mb-4">Aucune candidature pour le moment</p>
            <div className="flex gap-2 justify-center">
              <Button variant="secondary" onClick={() => setShowNewForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter manuellement
              </Button>
              <a href="/offres">
                <Button>Rechercher des offres</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.NOT_APPLIED;
            const isExpanded = expandedId === app.id;
            
            return (
              <Card key={app.id} className="border-zinc-700 overflow-hidden">
                <CardContent className="p-0">
                  {/* Main row */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-100">{app.companyName}</p>
                          <p className="text-sm text-zinc-400">{app.jobTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="text-sm text-zinc-500">{formatDate(app.appliedAt)}</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                      </div>
                    </div>
                    
                    {/* Mini Progress Bar */}
                    <MiniProgressTracker
                      applicationStatus={app.status}
                      emailSent={app.emailSent}
                      responseReceived={app.responseReceived}
                      responseType={app.responseType}
                    />
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-zinc-700 p-4 bg-zinc-900/50 space-y-6">
                      {/* Full Progress Tracker */}
                      <div>
                        <h4 className="text-sm font-medium text-zinc-300 mb-4">Progression</h4>
                        <ProgressTracker
                          applicationStatus={app.status}
                          emailSent={app.emailSent}
                          emailSentAt={app.emailSentAt}
                          responseReceived={app.responseReceived}
                          responseReceivedAt={app.responseReceivedAt}
                          responseType={app.responseType}
                          interviewAt={app.interviewAt}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEmailGenerator(showEmailGenerator === app.id ? null : app.id);
                            setShowCoverLetterGenerator(null);
                            setShowResponseForm(null);
                          }}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Générer email
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCoverLetterGenerator(showCoverLetterGenerator === app.id ? null : app.id);
                            setShowEmailGenerator(null);
                            setShowResponseForm(null);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Lettre motivation
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowResponseForm(showResponseForm === app.id ? null : app.id);
                            setShowEmailGenerator(null);
                            setShowCoverLetterGenerator(null);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Ajouter réponse
                        </Button>
                        {app.companyUrl && (
                          <a href={app.companyUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Site
                            </Button>
                          </a>
                        )}
                      </div>

                      {/* Email Generator */}
                      {showEmailGenerator === app.id && (
                        <div className="bg-zinc-800 rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-zinc-200 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-yellow-500" />
                              Générateur d'email
                            </h4>
                            <div className="flex gap-2">
                              {(["application", "followUp", "thankYou"] as const).map((type) => (
                                <button
                                  key={type}
                                  onClick={() => setEmailType(type)}
                                  className={`px-3 py-1 rounded text-xs ${
                                    emailType === type
                                      ? "bg-blue-600 text-white"
                                      : "bg-zinc-700 text-zinc-300"
                                  }`}
                                >
                                  {type === "application" ? "Candidature" : type === "followUp" ? "Relance" : "Remerciement"}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <Button 
                            onClick={() => generateEmail(app.id, app)} 
                            disabled={generating}
                            className="w-full"
                          >
                            {generating ? <Loader size="sm" className="mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            Générer l'email
                          </Button>

                          {generatedEmail && (
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs text-zinc-500">Objet</label>
                                <div className="flex gap-2">
                                  <Input value={generatedEmail.subject} readOnly className="bg-zinc-900" />
                                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedEmail.subject)}>
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <label className="text-xs text-zinc-500">Corps</label>
                                <div className="relative">
                                  <Textarea 
                                    value={generatedEmail.body} 
                                    readOnly 
                                    rows={10} 
                                    className="bg-zinc-900 text-sm"
                                  />
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="absolute top-2 right-2"
                                    onClick={() => copyToClipboard(generatedEmail.body)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <Button onClick={() => markEmailSent(app.id)} className="w-full">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Marquer comme envoyé
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Cover Letter Generator */}
                      {showCoverLetterGenerator === app.id && (
                        <div className="bg-zinc-800 rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-zinc-200 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-green-500" />
                              Lettre de motivation
                            </h4>
                            {/* Language Toggle */}
                            <div className="flex gap-1">
                              <button
                                onClick={() => setLanguage("fr")}
                                className={`px-2 py-1 rounded text-xs ${language === "fr" ? "bg-blue-600 text-white" : "bg-zinc-700 text-zinc-400"}`}
                              >
                                FR
                              </button>
                              <button
                                onClick={() => setLanguage("en")}
                                className={`px-2 py-1 rounded text-xs ${language === "en" ? "bg-blue-600 text-white" : "bg-zinc-700 text-zinc-400"}`}
                              >
                                EN
                              </button>
                            </div>
                          </div>
                          
                          {/* Tone Selection */}
                          <div className="flex gap-2 flex-wrap">
                            {(["harvard", "formal", "dynamic", "creative"] as const).map((tone) => (
                              <button
                                key={tone}
                                onClick={() => setCoverLetterTone(tone)}
                                className={`px-3 py-1.5 rounded text-xs ${
                                  coverLetterTone === tone
                                    ? tone === "harvard" ? "bg-amber-600 text-white" : "bg-green-600 text-white"
                                    : "bg-zinc-700 text-zinc-300"
                                }`}
                              >
                                {tone === "harvard" ? "🎓 Harvard" : tone === "formal" ? "Formel" : tone === "dynamic" ? "Dynamique" : "Créatif"}
                              </button>
                            ))}
                          </div>
                          
                          <Button 
                            onClick={() => generateCoverLetter(app)} 
                            disabled={generating}
                            className="w-full bg-green-600 hover:bg-green-500"
                          >
                            {generating ? <Loader size="sm" className="mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            {language === "fr" ? "Générer la lettre" : "Generate Letter"}
                          </Button>

                          {generatedCoverLetter && (
                            <div className="space-y-3">
                              <div className="relative">
                                <Textarea 
                                  value={generatedCoverLetter} 
                                  readOnly 
                                  rows={15} 
                                  className="bg-zinc-900 text-sm font-mono"
                                />
                                <div className="absolute top-2 right-2 flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copyToClipboard(generatedCoverLetter)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Response Form */}
                      {showResponseForm === app.id && (
                        <div className="bg-zinc-800 rounded-lg p-4 space-y-4">
                          <h4 className="font-medium text-zinc-200 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-purple-500" />
                            Ajouter une réponse
                          </h4>
                          
                          <div>
                            <label className="text-xs text-zinc-500 mb-2 block">Type de réponse</label>
                            <div className="flex gap-2">
                              {[
                                { id: "positive", label: "Positive", icon: CheckCircle2, color: "green" },
                                { id: "interview", label: "Entretien", icon: Calendar, color: "blue" },
                                { id: "negative", label: "Négative", icon: XCircle, color: "red" },
                                { id: "pending", label: "En attente", icon: Clock, color: "amber" },
                              ].map((type) => (
                                <button
                                  key={type.id}
                                  onClick={() => setResponseData({ ...responseData, type: type.id })}
                                  className={`flex items-center gap-1 px-3 py-2 rounded text-xs ${
                                    responseData.type === type.id
                                      ? `bg-${type.color}-600 text-white`
                                      : "bg-zinc-700 text-zinc-300"
                                  }`}
                                >
                                  <type.icon className="h-3 w-3" />
                                  {type.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-xs text-zinc-500 mb-2 block">Contenu de la réponse</label>
                            <Textarea
                              placeholder="Copiez-collez le contenu de l'email ou décrivez la réponse..."
                              value={responseData.content}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponseData({ ...responseData, content: e.target.value })}
                              rows={4}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-zinc-500 mb-2 block">Screenshot (optionnel)</label>
                            <div className="border-2 border-dashed border-zinc-600 rounded-lg p-4 text-center">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setResponseData({ ...responseData, screenshot: e.target.files?.[0] || null })}
                                className="hidden"
                                id={`screenshot-${app.id}`}
                              />
                              <label htmlFor={`screenshot-${app.id}`} className="cursor-pointer">
                                <Image className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
                                <p className="text-sm text-zinc-400">
                                  {responseData.screenshot ? responseData.screenshot.name : "Cliquez pour ajouter un screenshot"}
                                </p>
                              </label>
                            </div>
                          </div>

                          <Button onClick={() => submitResponse(app.id)} className="w-full">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Enregistrer la réponse
                          </Button>
                        </div>
                      )}

                      {/* Timeline */}
                      {app.timeline && app.timeline.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-3">Historique</h4>
                          <div className="space-y-2">
                            {app.timeline.slice(0, 5).map((event) => (
                              <div key={event.id} className="flex items-start gap-3 text-sm">
                                <div className="h-2 w-2 rounded-full bg-zinc-500 mt-1.5" />
                                <div>
                                  <p className="text-zinc-300">{event.title}</p>
                                  {event.description && (
                                    <p className="text-zinc-500 text-xs">{event.description}</p>
                                  )}
                                  <p className="text-zinc-600 text-xs">{formatDate(event.createdAt)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
