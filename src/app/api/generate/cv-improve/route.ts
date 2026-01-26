import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const ACTION_VERBS = {
  fr: {
    leadership: ["Dirigé", "Supervisé", "Coordonné", "Piloté", "Encadré", "Mené"],
    achievement: ["Atteint", "Réalisé", "Accompli", "Dépassé", "Obtenu", "Généré"],
    analysis: ["Analysé", "Évalué", "Diagnostiqué", "Étudié", "Examiné", "Identifié"],
    creation: ["Créé", "Conçu", "Développé", "Élaboré", "Initié", "Lancé"],
    improvement: ["Optimisé", "Amélioré", "Restructuré", "Modernisé", "Simplifié", "Automatisé"],
  },
  en: {
    leadership: ["Led", "Supervised", "Coordinated", "Directed", "Managed", "Oversaw"],
    achievement: ["Achieved", "Accomplished", "Exceeded", "Delivered", "Generated", "Increased"],
    analysis: ["Analyzed", "Evaluated", "Diagnosed", "Examined", "Identified", "Investigated"],
    creation: ["Created", "Designed", "Developed", "Established", "Initiated", "Launched"],
    improvement: ["Optimized", "Enhanced", "Restructured", "Modernized", "Streamlined", "Automated"],
  },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, cvText, language = "fr" } = await req.json();

    if (action === "analyze") {
      if (!cvText) {
        return NextResponse.json({ error: "CV text required" }, { status: 400 });
      }

      const wordCount = cvText.split(/\s+/).length;
      const hasQuantifiedResults = /\d+%|\d+ (euros?|€|\$|clients?|projets?)/i.test(cvText);
      const lang = language as "fr" | "en";
      const verbs = ACTION_VERBS[lang] || ACTION_VERBS.fr;
      const hasActionVerbs = Object.values(verbs).flat().some(v => cvText.toLowerCase().includes(v.toLowerCase()));

      const strengths: string[] = [];
      const weaknesses: string[] = [];
      const suggestions: { category: string; original: string; improved: string; reason: string }[] = [];

      let score = 50;

      if (wordCount > 200) { score += 10; strengths.push(lang === "fr" ? "CV détaillé" : "Detailed CV"); }
      else { weaknesses.push(lang === "fr" ? "CV trop court" : "CV too short"); }

      if (hasQuantifiedResults) { score += 15; strengths.push(lang === "fr" ? "Résultats quantifiés" : "Quantified results"); }
      else {
        score -= 5;
        weaknesses.push(lang === "fr" ? "Manque de résultats chiffrés" : "Missing quantified results");
        suggestions.push({
          category: "Impact",
          original: lang === "fr" ? "J'ai géré des projets" : "I managed projects",
          improved: lang === "fr" ? "Piloté 5 projets générant +30% de revenus" : "Led 5 projects generating +30% revenue",
          reason: lang === "fr" ? "Ajoutez des chiffres" : "Add numbers"
        });
      }

      if (hasActionVerbs) { score += 10; strengths.push(lang === "fr" ? "Verbes d'action utilisés" : "Action verbs used"); }
      else {
        weaknesses.push(lang === "fr" ? "Manque de verbes d'action" : "Missing action verbs");
        suggestions.push({
          category: "Vocabulaire",
          original: lang === "fr" ? "Responsable de l'équipe" : "Responsible for team",
          improved: lang === "fr" ? "Dirigé une équipe de 8 personnes" : "Led a team of 8",
          reason: lang === "fr" ? "Utilisez des verbes d'action" : "Use action verbs"
        });
      }

      if (cvText.includes("@") || cvText.includes("linkedin")) { score += 5; strengths.push(lang === "fr" ? "Coordonnées présentes" : "Contact info present"); }

      score = Math.min(100, Math.max(0, score));

      return NextResponse.json({ analysis: { score, strengths, weaknesses, suggestions } });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("CV improve error:", error);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}
