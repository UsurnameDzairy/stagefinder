"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, Calendar, FileText, MoreHorizontal, Plus, Mail, 
  MessageSquare, CheckCircle2, XCircle, Clock, TrendingUp,
  Copy, Download, Image, ChevronDown, ChevronUp, Sparkles,
  Building2, ExternalLink, Upload, Search
} from "lucide-react";
import { ProgressTracker, MiniProgressTracker } from "@/components/applications/progress-tracker";
import { Loader } from "@/components/ui/loader";
import { useTranslation, useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
  feedback: string | null;
  finalOutcome: string | null;
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

const getStatusConfig = (t: (key: string) => string): Record<string, { label: string; color: string }> => ({
  NOT_APPLIED: { label: t("applications.status.notApplied"), color: "bg-zinc-950 text-zinc-600 border border-zinc-900" },
  APPLIED: { label: t("applications.status.applied"), color: "bg-zinc-800 text-white border border-zinc-700" },
  IN_PROGRESS: { label: t("applications.status.inProgress"), color: "bg-zinc-900 text-zinc-400 border border-zinc-800" },
  INTERVIEW: { label: t("applications.status.interview"), color: "bg-zinc-700 text-white border border-zinc-600 shadow-[0_0_15px_rgba(255,255,255,0.05)]" },
  OFFER: { label: t("applications.status.offer"), color: "bg-white text-black border border-white font-bold" },
  REJECTED: { label: t("applications.status.rejected"), color: "bg-zinc-950 text-zinc-800 border border-zinc-900" },
  WITHDRAWN: { label: t("applications.status.withdrawn"), color: "bg-zinc-950 text-zinc-800 border border-zinc-900" },
});

export default function CandidaturesPage() {
  const { t } = useTranslation();
  const { language: currentLanguage } = useLanguage();
  const STATUS_CONFIG = getStatusConfig(t);
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
  const [language, setLanguage] = useState<"fr" | "en">(currentLanguage as "fr" | "en");
  const [responseData, setResponseData] = useState({ type: "pending", content: "", screenshot: null as File | null });
  const [showFeedbackForm, setShowFeedbackForm] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState({ outcome: "", feedback: "", lessonsLearned: "" });
  const [generating, setGenerating] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvText, setCvText] = useState<string | null>(null);

  // Charger le CV existant au démarrage
  useEffect(() => {
    fetchApplications();
    fetchExistingCV();
  }, []);

  const fetchExistingCV = async () => {
    try {
      const res = await fetch("/api/user/cv");
      const data = await res.json();
      if (data.resume) {
        setCvFileName(data.resume.fileName);
        setCvText(data.resume.extractedText);
      }
    } catch (error) {
      console.error("Error fetching CV:", error);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt') && !file.name.endsWith('.docx')) {
      alert(t("applications.cvUpload.unsupportedFormat"));
      return;
    }

    setCvUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/cv/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (data.success && data.text) {
        setCvFileName(file.name);
        setCvText(data.text);
        
        // Sauvegarder le CV dans le profil
        await fetch('/api/user/cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            extractedText: data.text,
          }),
        });
      } else {
        alert(data.error || "Error reading file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file");
    } finally {
      setCvUploading(false);
    }
  };

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
          appliedDate: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("en-US") : undefined,
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

  const submitFeedback = async (appId: string) => {
    try {
      await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finalOutcome: feedbackData.outcome,
          feedback: `${feedbackData.feedback}\n\nLessons learned: ${feedbackData.lessonsLearned}`,
          status: feedbackData.outcome === "got_internship" ? "OFFER" : feedbackData.outcome === "rejected" ? "REJECTED" : "WITHDRAWN",
        }),
      });

      fetchApplications();
      setShowFeedbackForm(null);
      setFeedbackData({ outcome: "", feedback: "", lessonsLearned: "" });
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const deleteApplication = async (appId: string) => {
    if (!confirm(t("applications.confirmDelete"))) return;

    try {
      await fetch(`/api/applications/${appId}`, {
        method: "DELETE",
      });
      fetchApplications();
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    const locale = currentLanguage === "fr" ? "fr-FR" : "en-US";
    return new Date(date).toLocaleDateString(locale, {
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
          <h1 className="text-4xl font-serif font-normal tracking-tight text-white flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-zinc-400" />
            {t("applications.title")}
          </h1>
          <p className="text-[13px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-1">
            {t("applications.subtitle")}
          </p>
        </div>
        <Button onClick={() => setShowNewForm(true)} className="bg-black hover:bg-zinc-900 text-white h-10 px-8 rounded-full font-serif italic text-sm border border-zinc-800 transition-all hover:scale-[1.05] active:scale-[0.95] shadow-xl">
          <Plus className="h-4 w-4 mr-2" />
          {t("applications.newApplication")}
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: t("applications.stats.total"), value: stats.total, color: "text-zinc-100" },
            { label: t("applications.stats.applied"), value: stats.applied, color: "text-zinc-300" },
            { label: t("applications.stats.pending"), value: stats.pending, color: "text-zinc-400" },
            { label: t("applications.stats.interviews"), value: stats.interview, color: "text-zinc-200" },
            { label: t("applications.stats.offers"), value: stats.offer, color: "text-white" },
            { label: t("applications.stats.rejected"), value: stats.rejected, color: "text-zinc-600" },
            { 
              label: t("applications.stats.successRate"), 
              value: `${stats.total > 0 ? Math.round((stats.interview + stats.offer) / stats.total * 100) : 0}%`,
              color: "text-zinc-100" 
            },
          ].map((stat, i) => (
            <Card key={i} className="bg-black border-zinc-900 shadow-none hover:border-zinc-800 transition-colors">
              <CardContent className="p-4 text-center">
                <p className={cn("text-2xl font-bold tracking-tighter mb-1", stat.color)}>{stat.value}</p>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CV Upload Section - More refined */}
      <Card className="border-zinc-900 bg-zinc-950/50 shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2.5 rounded-xl border transition-all duration-300",
                cvFileName ? "bg-white border-white" : "bg-black border-zinc-800"
              )}>
                <FileText className={cn("h-4 w-4", cvFileName ? "text-black" : "text-zinc-600")} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-zinc-200">
                  {cvFileName ? cvFileName : t("applications.cvUpload.title")}
                </p>
                <p className="text-[11px] font-medium text-zinc-500 mt-0.5">
                  {cvFileName
                    ? t("applications.cvUpload.descriptionWithFile")
                    : t("applications.cvUpload.description")}
                </p>
              </div>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleCvUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={cvUploading}
              />
              <Button 
                variant="outline" 
                size="sm" 
                disabled={cvUploading}
                className="h-9 text-[11px] font-bold uppercase tracking-wider border-zinc-800 hover:bg-zinc-900 transition-all"
              >
                {cvUploading ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5 mr-2" />
                    {cvFileName ? t("common.change") : t("common.upload")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Application Form */}
      {showNewForm && (
        <Card className="border-white bg-black shadow-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{t("applications.newApplication")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider ml-1">{t("applications.form.company")}</label>
                <Input
                  placeholder={t("applications.form.companyPlaceholder")}
                  value={newApp.companyName}
                  onChange={(e) => setNewApp({ ...newApp, companyName: e.target.value })}
                  className="h-10 bg-zinc-950 border-zinc-900 focus:border-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider ml-1">{t("applications.form.position")}</label>
                <Input
                  placeholder={t("applications.form.positionPlaceholder")}
                  value={newApp.jobTitle}
                  onChange={(e) => setNewApp({ ...newApp, jobTitle: e.target.value })}
                  className="h-10 bg-zinc-950 border-zinc-900 focus:border-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider ml-1">{t("applications.form.contactEmail")}</label>
                <Input
                  type="email"
                  placeholder={t("applications.form.emailPlaceholder")}
                  value={newApp.contactEmail}
                  onChange={(e) => setNewApp({ ...newApp, contactEmail: e.target.value })}
                  className="h-10 bg-zinc-950 border-zinc-900 focus:border-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider ml-1">{t("applications.form.careerSite")}</label>
                <Input
                  placeholder="https://..."
                  value={newApp.companyUrl}
                  onChange={(e) => setNewApp({ ...newApp, companyUrl: e.target.value })}
                  className="h-10 bg-zinc-950 border-zinc-900 focus:border-white transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-zinc-900">
              <Button variant="ghost" onClick={() => setShowNewForm(false)} className="text-zinc-500 hover:text-white h-10 px-6 font-bold text-[11px] uppercase tracking-widest rounded-full">{t("applications.form.cancel")}</Button>
              <Button onClick={createApplication} className="bg-black hover:bg-zinc-900 text-white h-10 px-8 font-serif italic text-sm rounded-full border border-zinc-800 shadow-xl transition-all hover:scale-105 active:scale-95">{t("applications.form.create")}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card className="border-dashed border-zinc-900 bg-transparent shadow-none">
          <CardContent className="py-20 text-center">
            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-full w-fit mx-auto mb-6">
              <Send className="h-8 w-8 text-zinc-700" />
            </div>
            <p className="text-zinc-500 font-medium mb-8">{t("applications.noApplications")}</p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => setShowNewForm(true)} className="h-10 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-950 text-[11px] font-bold uppercase tracking-widest px-8 rounded-full transition-all">
                <Plus className="h-3.5 w-3.5 mr-2" />
                {t("applications.addManually")}
              </Button>
              <Link href="/offres">
                <Button className="bg-black hover:bg-zinc-900 text-white h-10 px-8 font-serif italic text-sm rounded-full border border-zinc-800 shadow-xl transition-all hover:scale-105 active:scale-95">
                  <Search className="h-4 w-4 mr-2 text-zinc-400" />
                  {t("applications.searchOffers")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.NOT_APPLIED;
            const isExpanded = expandedId === app.id;
            
            return (
              <Card key={app.id} className={cn(
                "border-zinc-900 bg-black shadow-none overflow-hidden transition-all duration-300",
                isExpanded ? "border-zinc-700 ring-1 ring-zinc-800" : "hover:border-zinc-700"
              )}>
                <CardContent className="p-0">
                  {/* Main row */}
                  <div 
                    className="p-5 cursor-pointer flex items-center justify-between group transition-all"
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-11 w-11 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
                        <Building2 className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                      </div>
                      <div>
                        <p className="font-bold text-[15px] text-zinc-100 tracking-tight">{app.companyName}</p>
                        <p className="text-[13px] font-medium text-zinc-500">{app.jobTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end gap-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
                          status.color.includes('green') ? "border-zinc-700 text-zinc-300 bg-zinc-900" :
                          status.color.includes('amber') ? "border-zinc-800 text-zinc-400 bg-zinc-950" :
                          "border-zinc-900 text-zinc-500 bg-transparent"
                        )}>
                          {status.label}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{formatDate(app.appliedAt)}</span>
                      </div>
                      <div className="h-8 w-8 rounded-full border border-zinc-900 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-zinc-500" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />}
                      </div>
                    </div>
                  </div>
                  
                  {/* Mini Progress Bar - Made more subtle */}
                  <div className="px-5 pb-4">
                    <MiniProgressTracker
                      applicationStatus={app.status}
                      emailSent={app.emailSent}
                      responseReceived={app.responseReceived}
                      responseType={app.responseType}
                    />
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-zinc-900 p-6 bg-zinc-950/40 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* Full Progress Tracker */}
                      <div className="bg-black/40 border border-zinc-900 rounded-2xl p-6">
                        <h4 className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-8">{t("applications.progress")}</h4>
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

                      {/* Actions épurées */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "h-9 px-6 rounded-full text-[10px] font-serif italic tracking-tight border-zinc-800 transition-all",
                              showEmailGenerator === app.id ? "bg-white text-black border-white shadow-lg" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowEmailGenerator(showEmailGenerator === app.id ? null : app.id);
                              setShowCoverLetterGenerator(null);
                              setShowResponseForm(null);
                            }}
                          >
                            <Mail className="h-3.5 w-3.5 mr-2" />
                            Email
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "h-9 px-6 rounded-full text-[10px] font-serif italic tracking-tight border-zinc-800 transition-all",
                              showCoverLetterGenerator === app.id ? "bg-white text-black border-white shadow-lg" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCoverLetterGenerator(showCoverLetterGenerator === app.id ? null : app.id);
                              setShowEmailGenerator(null);
                              setShowResponseForm(null);
                            }}
                          >
                            <FileText className="h-3.5 w-3.5 mr-2" />
                            Letter
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "h-9 px-6 rounded-full text-[10px] font-serif italic tracking-tight border-zinc-800 transition-all",
                              showResponseForm === app.id ? "bg-white text-black border-white shadow-lg" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowResponseForm(showResponseForm === app.id ? null : app.id);
                              setShowEmailGenerator(null);
                              setShowCoverLetterGenerator(null);
                              setShowFeedbackForm(null);
                            }}
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-2" />
                            Response
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "h-9 px-6 rounded-full text-[10px] font-serif italic tracking-tight border-zinc-800 transition-all",
                              showFeedbackForm === app.id ? "bg-white text-black border-white shadow-lg" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowFeedbackForm(showFeedbackForm === app.id ? null : app.id);
                              setShowEmailGenerator(null);
                              setShowCoverLetterGenerator(null);
                              setShowResponseForm(null);
                            }}
                          >
                            <TrendingUp className="h-3.5 w-3.5 mr-2" />
                            {t("applications.feedback.button")}
                          </Button>
                          {app.companyUrl && (
                            <a href={app.companyUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-9 text-[11px] font-bold uppercase tracking-widest text-zinc-600 hover:text-zinc-300 hover:bg-transparent">
                                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                                Site
                              </Button>
                            </a>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteApplication(app.id);
                          }}
                          className="h-9 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-900"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-2" />
                          {t("applications.actions.delete")}
                        </Button>
                      </div>

                      {/* Email Generator Monochrome */}
                      {showEmailGenerator === app.id && (
                        <div className="bg-black border border-zinc-900 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
                              <Mail className="h-4 w-4 text-white" />
                              {t("applications.emailGenerator.title")}
                            </h4>
                          <div className="flex gap-1.5 p-1 bg-zinc-950 border border-zinc-900 rounded-lg">
                            {(["application", "followUp", "thankYou"] as const).map((type) => (
                              <button
                                key={type}
                                onClick={() => setEmailType(type)}
                                className={cn(
                                  "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                                  emailType === type
                                    ? "bg-zinc-800 text-white shadow-inner"
                                    : "text-zinc-600 hover:text-zinc-400"
                                )}
                              >
                                {t(`applications.emailTypes.${type}`)}
                              </button>
                            ))}
                          </div>
                          </div>

                          <Button
                            onClick={() => generateEmail(app.id, app)}
                            disabled={generating}
                            className="w-full bg-black hover:bg-zinc-900 text-white font-serif italic text-sm rounded-full h-11 border border-zinc-800 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {generating ? <Loader size="sm" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            {t("applications.emailGenerator.generate")}
                          </Button>

                          {generatedEmail && (
                            <div className="space-y-4 animate-in fade-in duration-500">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{t("applications.emailGenerator.subject")}</label>
                                <div className="flex gap-2">
                                  <Input value={generatedEmail.subject} readOnly className="bg-zinc-950 border-zinc-900 text-sm h-10 font-medium" />
                                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedEmail.subject)} className="h-10 border-zinc-900 hover:bg-zinc-900 px-3">
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{t("applications.emailGenerator.content")}</label>
                                <div className="relative group">
                                  <Textarea
                                    value={generatedEmail.body}
                                    readOnly
                                    rows={12}
                                    className="bg-zinc-950 border-zinc-900 text-[13px] leading-relaxed font-medium p-4 scrollbar-hide"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="absolute top-3 right-3 h-8 border-zinc-800 bg-zinc-950/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={() => copyToClipboard(generatedEmail.body)}
                                  >
                                    <Copy className="h-3.5 w-3.5 mr-2" />
                                    {t("applications.emailGenerator.copy")}
                                  </Button>
                                </div>
                              </div>
                              <Button onClick={() => markEmailSent(app.id)} className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 h-11 text-[11px] font-bold uppercase tracking-[0.15em]">
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                                {t("applications.emailGenerator.markSent")}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Cover Letter Generator Monochrome */}
                      {showCoverLetterGenerator === app.id && (
                        <div className="bg-black border border-zinc-900 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
                              <FileText className="h-4 w-4 text-white" />
                              {t("applications.coverLetter.title")}
                            </h4>
                            <div className="flex gap-1.5 p-1 bg-zinc-950 border border-zinc-900 rounded-lg">
                              <button
                                onClick={() => setLanguage("fr")}
                                className={cn("px-2.5 py-1 rounded text-[10px] font-bold transition-all", language === "fr" ? "bg-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-400")}
                              >
                                FR
                              </button>
                              <button
                                onClick={() => setLanguage("en")}
                                className={cn("px-2.5 py-1 rounded text-[10px] font-bold transition-all", language === "en" ? "bg-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-400")}
                              >
                                EN
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {(["harvard", "formal", "dynamic", "creative"] as const).map((tone) => (
                              <button
                                key={tone}
                                onClick={() => setCoverLetterTone(tone)}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all",
                                  coverLetterTone === tone
                                    ? "bg-zinc-800 border-zinc-600 text-white shadow-inner"
                                    : "bg-black border-zinc-900 text-zinc-600 hover:border-zinc-800 hover:text-zinc-400"
                                )}
                              >
                                {tone === "harvard" ? t("applications.coverLetter.styles.harvard") : tone === "formal" ? t("applications.coverLetter.styles.corporate") : tone === "dynamic" ? t("applications.coverLetter.styles.modern") : t("applications.coverLetter.styles.creative")}
                              </button>
                            ))}
                          </div>

                          <Button
                            onClick={() => generateCoverLetter(app)}
                            disabled={generating}
                            className="w-full bg-black hover:bg-zinc-900 text-white font-serif italic text-sm rounded-full h-12 border border-zinc-800 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {generating ? <Loader size="sm" /> : <Sparkles className="h-4 w-4 mr-2 text-zinc-400" />}
                            {t("applications.coverLetter.generate")}
                          </Button>

                          {generatedCoverLetter && (
                            <div className="space-y-4 animate-in fade-in duration-500">
                              <div className="relative group">
                                <Textarea 
                                  value={generatedCoverLetter} 
                                  readOnly 
                                  rows={18} 
                                  className="bg-zinc-950 border-zinc-900 text-[13px] leading-relaxed font-medium p-6 font-serif scrollbar-hide"
                                />
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 border-zinc-800 bg-zinc-950/80 backdrop-blur"
                                    onClick={() => copyToClipboard(generatedCoverLetter)}
                                  >
                                    <Copy className="h-3.5 w-3.5 mr-2" />
                                    {t("applications.coverLetter.copyLetter")}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Response Form Monochrome */}
                      {showResponseForm === app.id && (
                        <div className="bg-black border border-zinc-900 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
                            <MessageSquare className="h-4 w-4 text-white" />
                            {t("applications.response.title")}
                          </h4>

                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{t("applications.response.type")}</label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { id: "positive", label: t("applications.response.positive"), icon: CheckCircle2 },
                                { id: "interview", label: t("applications.response.interview"), icon: Calendar },
                                { id: "negative", label: t("applications.response.negative"), icon: XCircle },
                                { id: "pending", label: t("applications.response.pending"), icon: Clock },
                              ].map((type) => (
                                <button
                                  key={type.id}
                                  onClick={() => setResponseData({ ...responseData, type: type.id })}
                                  className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all",
                                    responseData.type === type.id
                                      ? "bg-zinc-800 border-zinc-600 text-white shadow-inner"
                                      : "bg-black border-zinc-900 text-zinc-600 hover:border-zinc-800 hover:text-zinc-400"
                                  )}
                                >
                                  <type.icon className="h-3.5 w-3.5" />
                                  {type.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{t("applications.response.notes")}</label>
                            <Textarea
                              placeholder={t("applications.response.notesPlaceholder")}
                              value={responseData.content}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponseData({ ...responseData, content: e.target.value })}
                              rows={4}
                              className="bg-zinc-950 border-zinc-900 text-[13px] font-medium p-4 focus:border-white transition-all"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{t("applications.response.screenshot")}</label>
                            <div className="border-2 border-dashed border-zinc-900 hover:border-zinc-700 bg-zinc-950/50 rounded-2xl p-8 text-center transition-all cursor-pointer group">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setResponseData({ ...responseData, screenshot: e.target.files?.[0] || null })}
                                className="hidden"
                                id={`screenshot-${app.id}`}
                              />
                              <label htmlFor={`screenshot-${app.id}`} className="cursor-pointer">
                                <Image className="h-8 w-8 text-zinc-700 mx-auto mb-3 group-hover:text-zinc-500 transition-colors" />
                                <p className="text-[12px] font-bold text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase tracking-widest">
                                  {responseData.screenshot ? responseData.screenshot.name : t("applications.response.dragDrop")}
                                </p>
                              </label>
                            </div>
                          </div>

                          <Button
                            onClick={() => submitResponse(app.id)}
                            className="w-full bg-black hover:bg-zinc-900 text-white font-serif italic text-sm rounded-full h-12 border border-zinc-800 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-zinc-400" />
                            {t("applications.response.save")}
                          </Button>
                        </div>
                      )}

                      {/* Feedback Form - Final Outcome */}
                      {showFeedbackForm === app.id && (
                        <div className="bg-black border border-zinc-900 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
                            <TrendingUp className="h-4 w-4 text-white" />
                            {t("applications.feedback.title")}
                          </h4>
                          <p className="text-[12px] text-zinc-500">{t("applications.feedback.description")}</p>

                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{t("applications.feedback.outcome")}</label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { id: "got_internship", label: t("applications.feedback.gotInternship"), icon: CheckCircle2, color: "text-emerald-400" },
                                { id: "rejected", label: t("applications.feedback.rejected"), icon: XCircle, color: "text-red-400" },
                                { id: "withdrew", label: t("applications.feedback.withdrew"), icon: Clock, color: "text-zinc-400" },
                              ].map((outcome) => (
                                <button
                                  key={outcome.id}
                                  onClick={() => setFeedbackData({ ...feedbackData, outcome: outcome.id })}
                                  className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all",
                                    feedbackData.outcome === outcome.id
                                      ? "bg-zinc-800 border-zinc-600 text-white shadow-inner"
                                      : "bg-black border-zinc-900 text-zinc-600 hover:border-zinc-800 hover:text-zinc-400"
                                  )}
                                >
                                  <outcome.icon className={cn("h-3.5 w-3.5", feedbackData.outcome === outcome.id && outcome.color)} />
                                  {outcome.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{t("applications.feedback.howItWent")}</label>
                            <Textarea
                              placeholder={t("applications.feedback.howItWentPlaceholder")}
                              value={feedbackData.feedback}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}
                              rows={4}
                              className="bg-zinc-950 border-zinc-900 text-[13px] font-medium p-4 focus:border-white transition-all"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">{t("applications.feedback.lessonsLearned")}</label>
                            <Textarea
                              placeholder={t("applications.feedback.lessonsLearnedPlaceholder")}
                              value={feedbackData.lessonsLearned}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedbackData({ ...feedbackData, lessonsLearned: e.target.value })}
                              rows={3}
                              className="bg-zinc-950 border-zinc-900 text-[13px] font-medium p-4 focus:border-white transition-all"
                            />
                            <p className="text-[10px] text-zinc-600 ml-1">{t("applications.feedback.kamWillAnalyze")}</p>
                          </div>

                          <Button
                            onClick={() => submitFeedback(app.id)}
                            disabled={!feedbackData.outcome}
                            className="w-full bg-black hover:bg-zinc-900 text-white font-serif italic text-sm rounded-full h-12 border border-zinc-800 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-zinc-400" />
                            {t("applications.feedback.save")}
                          </Button>
                        </div>
                      )}

                      {/* Timeline Monochrome */}
                      {app.timeline && app.timeline.length > 0 && (
                        <div className="bg-black/20 border border-zinc-900/50 rounded-2xl p-6">
                          <h4 className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-6">{t("applications.history")}</h4>
                          <div className="space-y-6">
                            {app.timeline.slice(0, 5).map((event) => (
                              <div key={event.id} className="flex items-start gap-4 text-sm relative">
                                <div className="absolute left-[7px] top-[14px] bottom-[-24px] w-[1px] bg-zinc-900 last:hidden" />
                                <div className="h-4 w-4 rounded-full border-2 border-zinc-800 bg-black mt-1 z-10" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <p className="text-[13px] font-bold text-zinc-200">{event.title}</p>
                                    <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">{formatDate(event.createdAt)}</p>
                                  </div>
                                  {event.description && (
                                    <p className="text-[12px] font-medium text-zinc-500 leading-relaxed">{event.description}</p>
                                  )}
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
