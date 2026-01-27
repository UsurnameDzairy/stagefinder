"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { useTranslation, useLanguage } from "@/lib/i18n";
import { FileText, Copy, Download, Check, Sparkles } from "lucide-react";

export default function LettresPage() {
  const { t } = useTranslation();
  const { language: currentLanguage } = useLanguage();
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [contractType, setContractType] = useState("stage");
  const [language, setLanguage] = useState(currentLanguage);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!companyName || !jobTitle) return;

    setLoading(true);
    setResult(null);

    // Simulate generation (replace with actual API call)
    await new Promise((r) => setTimeout(r, 2000));

    const letter = generateMockLetter(companyName, jobTitle, contractType, language);
    setResult(letter);
    setLoading(false);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (result) {
      const blob = new Blob([result], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lettre-motivation-${companyName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-serif font-normal tracking-tight text-white flex items-center gap-3">
          <FileText className="h-6 w-6 text-zinc-400" />
          {t("letters.title")}
        </h1>
        <p className="text-[13px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-1">
          {t("letters.subtitle")}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <Card className="bg-black border-zinc-900 shadow-none">
          <CardHeader className="p-6">
            <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{t("common.info")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">
                {t("applications.company")}
              </label>
              <Input
                placeholder="Ex: Goldman Sachs, Google, L'Oréal..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-11 bg-zinc-950 border-zinc-900 focus:border-white transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">
                {t("applications.position")}
              </label>
              <Input
                placeholder={t("letters.positionPlaceholder")}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="h-11 bg-zinc-950 border-zinc-900 focus:border-white transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">
                {t("letters.jobDescription")}
              </label>
              <textarea
                placeholder={t("letters.jobDescriptionPlaceholder")}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={5}
                className="flex w-full rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 shadow-none placeholder:text-zinc-700 focus-visible:outline-none focus-visible:border-zinc-500 transition-all resize-none font-medium leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">
                  {t("offers.contractTypes")}
                </label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-1 text-sm text-zinc-100 shadow-none focus:outline-none focus:border-zinc-500 transition-all font-medium"
                >
                  <option value="stage">{t("letters.contractTypes.internship")}</option>
                  <option value="alternance">{t("letters.contractTypes.apprenticeship")}</option>
                  <option value="cdi">{t("letters.contractTypes.fulltime")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">
                  {t("settings.language")}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "fr" | "en")}
                  className="flex h-11 w-full rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-1 text-sm text-zinc-100 shadow-none focus:outline-none focus:border-zinc-500 transition-all font-medium"
                >
                  <option value="fr">{t("letters.languages.french")}</option>
                  <option value="en">{t("letters.languages.english")}</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !companyName || !jobTitle}
              className="w-full bg-black hover:bg-zinc-900 text-white h-12 rounded-full border border-zinc-800 shadow-xl transition-all mt-4 font-serif italic text-base hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader size="sm" />
                  <span className="ml-3">{t("common.generating")}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-3 text-zinc-400" />
                  {t("letters.generate")}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-black border-zinc-900 shadow-none min-h-[600px] flex flex-col">
          <CardHeader className="p-6 flex flex-row items-center justify-between border-b border-zinc-900/50">
            <CardTitle className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{t("common.result")}</CardTitle>
            {result && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="h-9 px-6 rounded-full text-[10px] font-serif italic tracking-tight border-zinc-800 transition-all text-white hover:text-white hover:bg-zinc-900">
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="h-9 px-6 rounded-full text-[10px] font-serif italic tracking-tight border-zinc-800 transition-all text-white hover:text-white hover:bg-zinc-900">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {result ? (
              <div className="p-8 h-full animate-in fade-in duration-700">
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-8 h-full shadow-inner">
                  <pre className="whitespace-pre-wrap text-[13px] text-zinc-200 font-serif leading-relaxed h-full overflow-y-auto scrollbar-hide">
                    {result}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600 p-12 space-y-6">
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-full opacity-20">
                  <FileText className="h-12 w-12 text-white" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[13px] font-bold uppercase tracking-widest text-zinc-700">{t("common.awaitingGeneration")}</p>
                  <p className="text-[12px] font-medium max-w-[240px] leading-relaxed">
                    {t("letters.placeholder")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );}

function generateMockLetter(company: string, job: string, type: string, lang: string): string {
  if (lang === "en") {
    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${job} ${type === "stage" ? "internship" : type === "alternance" ? "apprenticeship" : "position"} at ${company}.

As a motivated student with a passion for professional development, I am eager to contribute to your team while gaining valuable hands-on experience in the field.

My academic background and personal projects have equipped me with the skills necessary to excel in this role. I am particularly drawn to ${company}'s innovative approach and commitment to excellence.

I am confident that my enthusiasm, adaptability, and dedication make me a strong candidate for this opportunity. I would welcome the chance to discuss how I can contribute to your team.

Thank you for considering my application. I look forward to the opportunity to speak with you.

Best regards,
[Your Name]`;
  }

  return `Madame, Monsieur,

Je me permets de vous adresser ma candidature pour le poste de ${job} en ${type === "stage" ? "stage" : type === "alternance" ? "alternance" : "CDI"} au sein de ${company}.

Actuellement en formation, je suis a la recherche d'une opportunite qui me permettrait de mettre en pratique mes competences tout en contribuant activement a vos projets.

Mon parcours academique et mes experiences personnelles m'ont permis de developper les competences necessaires pour ce poste. Je suis particulierement interesse(e) par l'approche innovante de ${company} et son engagement envers l'excellence.

Motive(e) et rigoureux(se), je suis convaincu(e) que mon profil correspond aux attentes de votre entreprise. Je serais ravi(e) de pouvoir echanger avec vous lors d'un entretien.

Dans l'attente de votre retour, je vous prie d'agreer, Madame, Monsieur, l'expression de mes salutations distinguees.

[Votre nom]`;
}
