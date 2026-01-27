import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ACTION_VERBS = {
  fr: {
    leadership: ["Dirigé", "Supervisé", "Coordonné", "Piloté", "Encadré", "Mené", "Orchestré", "Géré", "Administré"],
    achievement: ["Atteint", "Réalisé", "Accompli", "Dépassé", "Obtenu", "Généré", "Augmenté", "Réduit", "Livré"],
    analysis: ["Analysé", "Évalué", "Diagnostiqué", "Étudié", "Examiné", "Identifié", "Investigué", "Audité", "Mesuré"],
    communication: ["Présenté", "Négocié", "Convaincu", "Formé", "Conseillé", "Rédigé", "Communiqué", "Transmis"],
    creation: ["Créé", "Conçu", "Développé", "Élaboré", "Initié", "Lancé", "Fondé", "Implémenté", "Construit"],
    improvement: ["Optimisé", "Amélioré", "Restructuré", "Modernisé", "Simplifié", "Automatisé", "Accéléré", "Renforcé"],
  },
  en: {
    leadership: ["Led", "Supervised", "Coordinated", "Directed", "Managed", "Oversaw", "Orchestrated", "Headed", "Spearheaded"],
    achievement: ["Achieved", "Accomplished", "Exceeded", "Delivered", "Generated", "Increased", "Reduced", "Completed", "Drove"],
    analysis: ["Analyzed", "Evaluated", "Diagnosed", "Examined", "Identified", "Investigated", "Assessed", "Audited", "Measured"],
    communication: ["Presented", "Negotiated", "Persuaded", "Trained", "Advised", "Authored", "Communicated", "Conveyed"],
    creation: ["Created", "Designed", "Developed", "Established", "Initiated", "Launched", "Founded", "Implemented", "Built"],
    improvement: ["Optimized", "Enhanced", "Restructured", "Modernized", "Streamlined", "Automated", "Accelerated", "Strengthened"],
  },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, cvText, language = "fr" } = await req.json();
    const lang = language as "fr" | "en";

    // Return action verbs for suggestions tab
    if (action === "suggestions") {
      return NextResponse.json({ actionVerbs: ACTION_VERBS[lang] || ACTION_VERBS.fr });
    }

    // Analyze CV
    if (action === "analyze") {
      if (!cvText) {
        return NextResponse.json({ error: "CV text required" }, { status: 400 });
      }

      const wordCount = cvText.split(/\s+/).length;
      const hasQuantifiedResults = /\d+%|\d+ (euros?|€|\$|clients?|projets?|projects?|revenue|increase)/i.test(cvText);
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
          reason: lang === "fr" ? "Ajoutez des chiffres concrets" : "Add concrete numbers"
        });
      }

      if (hasActionVerbs) { score += 10; strengths.push(lang === "fr" ? "Verbes d'action utilisés" : "Action verbs used"); }
      else {
        weaknesses.push(lang === "fr" ? "Manque de verbes d'action" : "Missing action verbs");
        suggestions.push({
          category: lang === "fr" ? "Vocabulaire" : "Vocabulary",
          original: lang === "fr" ? "Responsable de l'équipe" : "Responsible for team",
          improved: lang === "fr" ? "Dirigé une équipe de 8 personnes" : "Led a team of 8",
          reason: lang === "fr" ? "Utilisez des verbes d'action" : "Use action verbs"
        });
      }

      if (cvText.includes("@") || cvText.includes("linkedin")) {
        score += 5;
        strengths.push(lang === "fr" ? "Coordonnées présentes" : "Contact info present");
      }

      if (/master|bachelor|degree|diploma|university|école|ingénieur|licence/i.test(cvText)) {
        score += 5;
        strengths.push(lang === "fr" ? "Formation mentionnée" : "Education mentioned");
      }

      if (/skills?|compétences?|technical|technique/i.test(cvText)) {
        score += 5;
        strengths.push(lang === "fr" ? "Section compétences" : "Skills section");
      }

      score = Math.min(100, Math.max(0, score));

      return NextResponse.json({ analysis: { score, strengths, weaknesses, suggestions } });
    }

    // Improve CV
    if (action === "improve") {
      if (!cvText) {
        return NextResponse.json({ error: "CV text required" }, { status: 400 });
      }

      let improved = cvText;

      const replacements = lang === "fr" ? [
        { from: /responsable de/gi, to: "Dirigé" },
        { from: /en charge de/gi, to: "Piloté" },
        { from: /j'ai fait/gi, to: "Réalisé" },
        { from: /j'ai travaillé sur/gi, to: "Développé" },
        { from: /aidé à/gi, to: "Contribué à" },
        { from: /participé à/gi, to: "Collaboré sur" },
      ] : [
        { from: /responsible for/gi, to: "Led" },
        { from: /in charge of/gi, to: "Managed" },
        { from: /helped with/gi, to: "Contributed to" },
        { from: /worked on/gi, to: "Developed" },
        { from: /participated in/gi, to: "Collaborated on" },
        { from: /was involved in/gi, to: "Spearheaded" },
      ];

      for (const { from, to } of replacements) {
        improved = improved.replace(from, to);
      }

      const wordCount = improved.split(/\s+/).length;
      const hasQuantifiedResults = /\d+%|\d+ /i.test(improved);
      const verbs = ACTION_VERBS[lang] || ACTION_VERBS.fr;
      const hasActionVerbs = Object.values(verbs).flat().some(v => improved.toLowerCase().includes(v.toLowerCase()));

      let score = 60;
      if (wordCount > 200) score += 10;
      if (hasQuantifiedResults) score += 15;
      if (hasActionVerbs) score += 15;
      score = Math.min(100, score);

      return NextResponse.json({
        improvedCV: improved,
        analysis: {
          score,
          strengths: [
            lang === "fr" ? "Verbes d'action renforcés" : "Enhanced action verbs",
            lang === "fr" ? "Formulation professionnelle" : "Professional wording"
          ],
          weaknesses: [],
          suggestions: []
        }
      });
    }

    // Generate CV from profile
    if (action === "generate") {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        include: {
          profile: true,
          skills: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const profile = user.profile;
      const skills = user.skills.map(s => s.name);
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Your Name";

      const generatedCV = lang === "fr"
        ? `${fullName.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${user.email}${profile?.phone ? ` | ${profile.phone}` : ""}
${profile?.linkedinUrl ? `LinkedIn: ${profile.linkedinUrl}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${profile?.schoolName || "[Nom de l'école]"}
${profile?.educationLevel || "[Niveau d'études]"} | ${profile?.specialty || "[Spécialité]"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXPÉRIENCE PROFESSIONNELLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Titre du poste] | [Entreprise] | [Dates]
• Dirigé [description avec résultats quantifiés]
• Développé [description avec impact mesurable]
• Optimisé [description avec pourcentages]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPÉTENCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${skills.length > 0 ? skills.join(" | ") : "[Ajoutez vos compétences]"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LANGUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${profile?.languages || "Français (Natif) | Anglais (Courant)"}`
        : `${fullName.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${user.email}${profile?.phone ? ` | ${profile.phone}` : ""}
${profile?.linkedinUrl ? `LinkedIn: ${profile.linkedinUrl}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDUCATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${profile?.schoolName || "[University Name]"}
${profile?.educationLevel || "[Degree Level]"} | ${profile?.specialty || "[Major]"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFESSIONAL EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Position Title] | [Company] | [Dates]
• Led [description with quantified results]
• Developed [description with measurable impact]
• Optimized [description with percentages]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKILLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${skills.length > 0 ? skills.join(" | ") : "[Add your skills]"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LANGUAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${profile?.languages || "English (Native) | French (Fluent)"}`;

      return NextResponse.json({ generatedCV });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("CV improve error:", error);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}
