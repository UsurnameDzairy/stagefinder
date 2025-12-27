"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { FileText, Copy, Download, Check } from "lucide-react";

export default function LettresPage() {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [contractType, setContractType] = useState("stage");
  const [language, setLanguage] = useState("fr");
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
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Generation de lettres</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Creez des lettres de motivation personnalisees
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-300 block mb-1.5">
                Entreprise
              </label>
              <Input
                placeholder="Nom de l'entreprise"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300 block mb-1.5">
                Poste
              </label>
              <Input
                placeholder="Titre du poste"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300 block mb-1.5">
                Description de l'offre (optionnel)
              </label>
              <textarea
                placeholder="Collez la description pour une lettre plus personnalisee..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                className="flex w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-1.5">
                  Type de contrat
                </label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-100 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
                >
                  <option value="stage">Stage</option>
                  <option value="alternance">Alternance</option>
                  <option value="cdi">CDI</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-1.5">
                  Langue
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-100 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
                >
                  <option value="fr">Francais</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !companyName || !jobTitle}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Generation en cours...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generer la lettre
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Resultat</CardTitle>
            {result && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="bg-zinc-800 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-zinc-200 font-sans leading-relaxed">
                  {result}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">La lettre generee apparaitra ici</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
