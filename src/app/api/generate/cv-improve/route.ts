import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Harvard-style CV Analyzer and Improver
 * Analyzes CV content and suggests improvements using sophisticated vocabulary
 */

// Harvard-style action verbs by category
const HARVARD_ACTION_VERBS = {
  en: {
    leadership: [
      "Spearheaded", "Orchestrated", "Pioneered", "Championed", "Directed",
      "Mobilized", "Galvanized", "Steered", "Helmed", "Catalyzed"
    ],
    achievement: [
      "Accelerated", "Amplified", "Achieved", "Attained", "Surpassed",
      "Exceeded", "Outperformed", "Maximized", "Optimized", "Transformed"
    ],
    analysis: [
      "Synthesized", "Evaluated", "Assessed", "Investigated", "Examined",
      "Diagnosed", "Scrutinized", "Dissected", "Interpreted", "Quantified"
    ],
    communication: [
      "Articulated", "Conveyed", "Persuaded", "Negotiated", "Collaborated",
      "Liaised", "Facilitated", "Presented", "Advocated", "Mediated"
    ],
    creation: [
      "Conceptualized", "Devised", "Formulated", "Engineered", "Architected",
      "Designed", "Developed", "Constructed", "Established", "Instituted"
    ],
    improvement: [
      "Streamlined", "Revitalized", "Restructured", "Modernized", "Enhanced",
      "Refined", "Elevated", "Revolutionized", "Reinvented", "Overhauled"
    ],
  },
  fr: {
    leadership: [
      "Piloté", "Orchestré", "Dirigé", "Supervisé", "Coordonné",
      "Encadré", "Mobilisé", "Fédéré", "Conduit", "Initié"
    ],
    achievement: [
      "Accompli", "Atteint", "Dépassé", "Surpassé", "Optimisé",
      "Maximisé", "Réalisé", "Concrétisé", "Obtenu", "Généré"
    ],
    analysis: [
      "Analysé", "Évalué", "Diagnostiqué", "Examiné", "Investigué",
      "Synthétisé", "Interprété", "Quantifié", "Mesuré", "Audité"
    ],
    communication: [
      "Négocié", "Présenté", "Convaincu", "Collaboré", "Facilité",
      "Articulé", "Communiqué", "Représenté", "Conseillé", "Formé"
    ],
    creation: [
      "Conçu", "Développé", "Créé", "Élaboré", "Architecturé",
      "Construit", "Établi", "Fondé", "Instauré", "Mis en place"
    ],
    improvement: [
      "Optimisé", "Restructuré", "Modernisé", "Amélioré", "Transformé",
      "Rationalisé", "Revitalisé", "Renforcé", "Perfectionné", "Rehaussé"
    ],
  },
};

// Harvard-style phrases for CV sections
const HARVARD_PHRASES = {
  en: {
    quantification: [
      "resulting in a {percent}% increase in",
      "driving {percent}% improvement in",
      "achieving {number}+ in",
      "managing a portfolio of ${amount}",
      "leading a team of {number} professionals",
      "impacting {number}+ stakeholders",
    ],
    impact: [
      "directly contributing to organizational objectives",
      "delivering measurable business outcomes",
      "demonstrating quantifiable results",
      "generating significant value creation",
      "enhancing operational efficiency",
    ],
    skills: [
      "leveraging expertise in",
      "applying advanced knowledge of",
      "utilizing proficiency in",
      "demonstrating mastery of",
      "employing sophisticated understanding of",
    ],
  },
  fr: {
    quantification: [
      "générant une augmentation de {percent}% de",
      "permettant une amélioration de {percent}% de",
      "atteignant {number}+ en",
      "gérant un portefeuille de {amount}€",
      "encadrant une équipe de {number} collaborateurs",
      "impactant {number}+ parties prenantes",
    ],
    impact: [
      "contribuant directement aux objectifs stratégiques",
      "délivrant des résultats mesurables",
      "démontrant des performances quantifiables",
      "générant une création de valeur significative",
      "améliorant l'efficacité opérationnelle",
    ],
    skills: [
      "mobilisant une expertise en",
      "appliquant des connaissances avancées en",
      "utilisant une maîtrise approfondie de",
      "démontrant une expertise de",
      "employant une compréhension sophistiquée de",
    ],
  },
};

interface CVAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: Suggestion[];
  improvedSections: ImprovedSection[];
}

interface Suggestion {
  category: string;
  original: string;
  improved: string;
  reason: string;
}

interface ImprovedSection {
  title: string;
  originalContent: string;
  improvedContent: string;
}

function analyzeCV(cvText: string, language: "fr" | "en"): CVAnalysis {
  const lines = cvText.split("\n").filter(l => l.trim());
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: Suggestion[] = [];
  let score = 50;

  // Check for quantification
  const hasNumbers = /\d+%|\d+\s*(k|K|M|€|\$)|\d{2,}/.test(cvText);
  if (hasNumbers) {
    strengths.push(language === "fr" 
      ? "Utilisation de données chiffrées pour quantifier les réalisations"
      : "Uses quantified data to demonstrate achievements");
    score += 10;
  } else {
    weaknesses.push(language === "fr"
      ? "Manque de données chiffrées pour quantifier l'impact"
      : "Lacks quantified metrics to demonstrate impact");
    score -= 5;
  }

  // Check for action verbs
  const allVerbs = [
    ...HARVARD_ACTION_VERBS[language].leadership,
    ...HARVARD_ACTION_VERBS[language].achievement,
    ...HARVARD_ACTION_VERBS[language].analysis,
  ];
  const hasStrongVerbs = allVerbs.some(verb => 
    cvText.toLowerCase().includes(verb.toLowerCase())
  );
  
  if (hasStrongVerbs) {
    strengths.push(language === "fr"
      ? "Utilisation de verbes d'action percutants"
      : "Uses strong action verbs");
    score += 10;
  } else {
    weaknesses.push(language === "fr"
      ? "Verbes d'action faibles - utiliser des verbes plus percutants"
      : "Weak action verbs - use more impactful verbs");
    score -= 5;
  }

  // Check for common weak phrases
  const weakPhrases = language === "fr"
    ? ["responsable de", "en charge de", "j'ai fait", "j'ai travaillé", "participation à"]
    : ["responsible for", "in charge of", "worked on", "helped with", "participated in"];
  
  weakPhrases.forEach(phrase => {
    if (cvText.toLowerCase().includes(phrase.toLowerCase())) {
      const verbCategory = Object.keys(HARVARD_ACTION_VERBS[language])[
        Math.floor(Math.random() * Object.keys(HARVARD_ACTION_VERBS[language]).length)
      ] as keyof typeof HARVARD_ACTION_VERBS["en"];
      
      const strongVerb = HARVARD_ACTION_VERBS[language][verbCategory][
        Math.floor(Math.random() * HARVARD_ACTION_VERBS[language][verbCategory].length)
      ];
      
      suggestions.push({
        category: language === "fr" ? "Verbes d'action" : "Action Verbs",
        original: phrase,
        improved: strongVerb,
        reason: language === "fr"
          ? `"${phrase}" est passif. Utilisez "${strongVerb}" pour montrer votre impact direct.`
          : `"${phrase}" is passive. Use "${strongVerb}" to show direct impact.`,
      });
      score -= 2;
    }
  });

  // Check length
  if (lines.length < 15) {
    weaknesses.push(language === "fr"
      ? "CV trop court - développez vos expériences avec plus de détails"
      : "CV too short - expand on your experiences with more details");
    score -= 5;
  } else if (lines.length > 60) {
    weaknesses.push(language === "fr"
      ? "CV trop long - concentrez-vous sur les expériences les plus pertinentes"
      : "CV too long - focus on most relevant experiences");
    score -= 5;
  } else {
    strengths.push(language === "fr"
      ? "Longueur appropriée du CV"
      : "Appropriate CV length");
    score += 5;
  }

  // Check for skills section
  if (cvText.toLowerCase().includes("compétences") || cvText.toLowerCase().includes("skills")) {
    strengths.push(language === "fr"
      ? "Section compétences présente"
      : "Skills section present");
    score += 5;
  }

  // Check for education
  if (cvText.toLowerCase().includes("formation") || cvText.toLowerCase().includes("education") || cvText.toLowerCase().includes("diplôme")) {
    strengths.push(language === "fr"
      ? "Section formation présente"
      : "Education section present");
    score += 5;
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    strengths,
    weaknesses,
    suggestions,
    improvedSections: [],
  };
}

function improveCVContent(cvText: string, language: "fr" | "en"): string {
  let improved = cvText;
  
  // Replace weak phrases with strong ones
  const replacements: Record<string, Record<string, string>> = {
    fr: {
      "responsable de": "Piloté",
      "en charge de": "Dirigé",
      "j'ai fait": "Réalisé",
      "j'ai travaillé": "Contribué activement à",
      "participation à": "Participation active à",
      "j'ai aidé": "Accompagné",
      "bon": "excellent",
      "bien": "avec excellence",
      "travail en équipe": "collaboration transversale",
      "problèmes": "défis",
      "tâches": "missions stratégiques",
    },
    en: {
      "responsible for": "Spearheaded",
      "in charge of": "Directed",
      "worked on": "Engineered",
      "helped with": "Facilitated",
      "participated in": "Actively contributed to",
      "did": "Executed",
      "made": "Developed",
      "good": "exceptional",
      "teamwork": "cross-functional collaboration",
      "problems": "challenges",
      "tasks": "strategic initiatives",
    },
  };

  Object.entries(replacements[language]).forEach(([weak, strong]) => {
    const regex = new RegExp(weak, "gi");
    improved = improved.replace(regex, strong);
  });

  return improved;
}

function generateHarvardCV(
  profile: {
    name: string;
    email?: string;
    phone?: string;
    education?: string;
    skills: string[];
    experiences?: string;
  },
  language: "fr" | "en"
): string {
  const { name, email, phone, education, skills, experiences } = profile;
  
  const header = language === "fr" ? `
═══════════════════════════════════════════════════════════════
                        ${name.toUpperCase()}
═══════════════════════════════════════════════════════════════
${email ? `Email: ${email}` : ""}${phone ? ` | Tél: ${phone}` : ""}

───────────────────────────────────────────────────────────────
                         PROFIL
───────────────────────────────────────────────────────────────
Professionnel ambitieux et rigoureux, doté d'une solide formation académique 
et d'une capacité démontrée à générer des résultats mesurables. Expert en 
résolution de problèmes complexes et en collaboration transversale.

───────────────────────────────────────────────────────────────
                       FORMATION
───────────────────────────────────────────────────────────────
${education || "• [Votre formation]"}

───────────────────────────────────────────────────────────────
                      COMPÉTENCES
───────────────────────────────────────────────────────────────
${skills.length > 0 ? skills.map(s => `• ${s}`).join("\n") : "• [Vos compétences]"}

───────────────────────────────────────────────────────────────
                      EXPÉRIENCES
───────────────────────────────────────────────────────────────
${experiences || `• Orchestré [projet/initiative], générant une amélioration de X% des résultats
• Piloté une équipe de X collaborateurs dans la réalisation de [objectif]
• Conçu et implémenté [solution], réduisant les coûts de X%
• Collaboré avec les parties prenantes pour [réalisation]`}
` : `
═══════════════════════════════════════════════════════════════
                        ${name.toUpperCase()}
═══════════════════════════════════════════════════════════════
${email ? `Email: ${email}` : ""}${phone ? ` | Phone: ${phone}` : ""}

───────────────────────────────────────────────────────────────
                         PROFILE
───────────────────────────────────────────────────────────────
Results-driven professional with rigorous academic training and demonstrated 
ability to deliver measurable outcomes. Expert in complex problem-solving 
and cross-functional collaboration.

───────────────────────────────────────────────────────────────
                        EDUCATION
───────────────────────────────────────────────────────────────
${education || "• [Your education]"}

───────────────────────────────────────────────────────────────
                         SKILLS
───────────────────────────────────────────────────────────────
${skills.length > 0 ? skills.map(s => `• ${s}`).join("\n") : "• [Your skills]"}

───────────────────────────────────────────────────────────────
                       EXPERIENCE
───────────────────────────────────────────────────────────────
${experiences || `• Spearheaded [project/initiative], driving X% improvement in outcomes
• Led a team of X professionals in achieving [objective]
• Architected and implemented [solution], reducing costs by X%
• Collaborated with stakeholders to deliver [achievement]`}
`;

  return header.trim();
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, cvText, language = "fr" } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { profile: true, skills: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "";
    const userSkills = user.skills.map(s => s.name);
    const education = user.profile?.educationLevel
      ? `${user.profile.educationLevel}${user.profile.schoolName ? ` - ${user.profile.schoolName}` : ""}`
      : "";

    switch (action) {
      case "analyze": {
        if (!cvText) {
          return NextResponse.json({ error: "CV text required" }, { status: 400 });
        }
        const analysis = analyzeCV(cvText, language);
        return NextResponse.json({ success: true, analysis });
      }

      case "improve": {
        if (!cvText) {
          return NextResponse.json({ error: "CV text required" }, { status: 400 });
        }
        const lang = language as "fr" | "en";
        const improvedCV = improveCVContent(cvText, lang);
        const analysisResult = analyzeCV(improvedCV, lang);
        return NextResponse.json({ 
          success: true, 
          improvedCV,
          analysis: analysisResult,
          actionVerbs: HARVARD_ACTION_VERBS[lang],
        });
      }

      case "generate": {
        const lang = language as "fr" | "en";
        const generatedCV = generateHarvardCV({
          name: userName,
          email: user.email,
          phone: user.profile?.phone || undefined,
          education,
          skills: userSkills,
        }, lang);
        return NextResponse.json({ success: true, generatedCV });
      }

      case "suggestions": {
        const lang = language as "fr" | "en";
        return NextResponse.json({
          success: true,
          actionVerbs: HARVARD_ACTION_VERBS[lang],
          phrases: HARVARD_PHRASES[lang],
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("CV improve error:", error);
    return NextResponse.json({ error: "Failed to process CV" }, { status: 500 });
  }
}
