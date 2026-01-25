import { prisma } from "@/lib/prisma";
import { chatWithAssistant as callOpenRouterChat } from "@/lib/openrouter";

export interface UserContext {
  profile?: {
    schoolName?: string | null;
    educationLevel?: string | null;
    specialty?: string | null;
    preferredCities?: string | null;
    contractTypes?: string | null;
    domains?: string | null;
    languages?: string | null;
    bio?: string | null;
  } | null;
  skills: Array<{
    name: string;
    category?: string | null;
    level?: string | null;
  }>;
  resumes: Array<{
    skills?: string | null;
    experience?: string | null;
    education?: string | null;
  }>;
  applications: Array<{
    companyName: string;
    jobTitle: string;
    status: string;
  }>;
  savedOffers: number;
  careerObjectives: Array<{
    objective: string;
    targetRoles?: string | null;
    targetSectors?: string | null;
    targetCompanies?: string | null;
    timeline?: string | null;
    priorities?: string | null;
  }>;
  aiInsights: Array<{
    type: string;
    content: string;
    createdAt: Date;
  }>;
}

export async function getUserContext(userId: string): Promise<UserContext> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        skills: {
          select: {
            name: true,
            category: true,
            level: true,
          },
        },
        resumes: {
          where: { isActive: true },
          select: {
            skills: true,
            experience: true,
            education: true,
          },
        },
        applications: {
          select: {
            companyName: true,
            jobTitle: true,
            status: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        savedOffers: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Fetch career objectives and insights separately to handle if tables don't exist yet
    let careerObjectives: UserContext['careerObjectives'] = [];
    let aiInsights: UserContext['aiInsights'] = [];

    try {
      const objectives = await prisma.careerObjective.findMany({
        where: { userId, isActive: true },
        select: {
          objective: true,
          targetRoles: true,
          targetSectors: true,
          targetCompanies: true,
          timeline: true,
          priorities: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      });
      careerObjectives = objectives;
    } catch (e) {
      console.log("CareerObjective table not available yet");
    }

    try {
      const insights = await prisma.aIInsight.findMany({
        where: { userId },
        select: {
          type: true,
          content: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      aiInsights = insights;
    } catch (e) {
      console.log("AIInsight table not available yet");
    }

    return {
      profile: user.profile,
      skills: user.skills,
      resumes: user.resumes,
      applications: user.applications,
      savedOffers: user.savedOffers.length,
      careerObjectives,
      aiInsights,
    };
  } catch (error) {
    console.error("getUserContext error:", error);
    // Return empty context on error
    return {
      profile: null,
      skills: [],
      resumes: [],
      applications: [],
      savedOffers: 0,
      careerObjectives: [],
      aiInsights: [],
    };
  }
}

export function generateSystemPrompt(context: UserContext): string {
  const { profile, skills, resumes, applications, careerObjectives, aiInsights } = context;

  // Si le contexte est vide, c'est qu'un CV a été fourni directement
  const hasStoredProfile = profile || skills.length > 0 || resumes.length > 0;

  let prompt = `Tu es un conseiller carrière expérimenté et bienveillant. Tu parles de manière naturelle et humaine, comme un mentor qui discute avec un étudiant.

RÈGLES DE COMMUNICATION ABSOLUES:
- Réponds de manière conversationnelle et naturelle, comme dans une vraie discussion
- N'utilise JAMAIS d'emojis, d'émoticônes ou de symboles décoratifs (pas de 💡, 🎯, ✨, etc.)
- Évite les listes à puces systématiques - préfère des paragraphes fluides
- Ne structure pas tes réponses avec des titres en majuscules ou des sections rigides
- Parle à la première personne ("Je te conseille...", "À mon avis...")
- Sois chaleureux mais professionnel
- Donne des conseils personnalisés, pas des réponses génériques

`;

  if (!hasStoredProfile) {
    prompt += `IMPORTANT: L'utilisateur va te fournir le contenu de son CV directement dans son message. 
Analyse UNIQUEMENT ce CV fourni. Ne fais AUCUNE supposition sur son profil.
Extrait les informations clés du CV: nom, formation, expériences, compétences, langues, etc.
Base ton analyse EXCLUSIVEMENT sur le contenu du CV qu'il te fournit.

`;
  } else {
    prompt += `PROFIL DE L'UTILISATEUR:
`;
  }

  if (profile) {
    if (profile.schoolName) prompt += `- École: ${profile.schoolName}\n`;
    if (profile.educationLevel) prompt += `- Niveau d'études: ${profile.educationLevel}\n`;
    if (profile.specialty) prompt += `- Spécialité: ${profile.specialty}\n`;
    if (profile.preferredCities) prompt += `- Villes préférées: ${profile.preferredCities}\n`;
    if (profile.contractTypes) prompt += `- Types de contrat: ${profile.contractTypes}\n`;
    if (profile.domains) prompt += `- Domaines d'intérêt: ${profile.domains}\n`;
    if (profile.languages) prompt += `- Langues: ${profile.languages}\n`;
  }

  if (skills.length > 0) {
    prompt += `\nCOMPÉTENCES:\n`;
    skills.forEach((skill) => {
      prompt += `- ${skill.name}`;
      if (skill.level) prompt += ` (${skill.level})`;
      if (skill.category) prompt += ` [${skill.category}]`;
      prompt += `\n`;
    });
  }

  if (resumes.length > 0 && resumes[0]) {
    const resume = resumes[0];
    if (resume.experience) prompt += `\nEXPÉRIENCE:\n${resume.experience}\n`;
    if (resume.education) prompt += `\nFORMATION:\n${resume.education}\n`;
  }

  if (applications.length > 0) {
    prompt += `\nCANDIDATURES RÉCENTES:\n`;
    applications.slice(0, 5).forEach((app) => {
      prompt += `- ${app.jobTitle} chez ${app.companyName} (${app.status})\n`;
    });
  }

  // Ajouter les objectifs de carrière
  if (careerObjectives && careerObjectives.length > 0) {
    prompt += `\nOBJECTIFS DE CARRIÈRE:\n`;
    careerObjectives.forEach((obj) => {
      prompt += `- ${obj.objective}\n`;
      if (obj.targetRoles) {
        try {
          const roles = JSON.parse(obj.targetRoles);
          if (Array.isArray(roles) && roles.length > 0) {
            prompt += `  Postes ciblés: ${roles.join(', ')}\n`;
          }
        } catch {}
      }
      if (obj.targetSectors) {
        try {
          const sectors = JSON.parse(obj.targetSectors);
          if (Array.isArray(sectors) && sectors.length > 0) {
            prompt += `  Secteurs: ${sectors.join(', ')}\n`;
          }
        } catch {}
      }
      if (obj.targetCompanies) {
        try {
          const companies = JSON.parse(obj.targetCompanies);
          if (Array.isArray(companies) && companies.length > 0) {
            prompt += `  Entreprises cibles: ${companies.join(', ')}\n`;
          }
        } catch {}
      }
      if (obj.timeline) prompt += `  Horizon: ${obj.timeline}\n`;
    });
  }

  // Ajouter les insights précédents pour continuité
  if (aiInsights && aiInsights.length > 0) {
    prompt += `\nCONSEILS PRÉCÉDENTS DONNÉS:\n`;
    const recentInsights = aiInsights.slice(0, 5);
    recentInsights.forEach((insight) => {
      const typeLabels: Record<string, string> = {
        'company_recommendation': 'Entreprises recommandées',
        'cv_improvement': 'Amélioration CV',
        'skill_suggestion': 'Compétences suggérées',
        'strategy': 'Stratégie',
        'interview_tip': 'Conseil entretien',
      };
      prompt += `- [${typeLabels[insight.type] || insight.type}]: ${insight.content.slice(0, 100)}...\n`;
    });
    prompt += `\nTiens compte de ces conseils précédents pour assurer la continuité et éviter les répétitions.\n`;
  }

  prompt += `
Si l'utilisateur fournit son CV (entre === CONTENU DE MON CV === et === FIN DU CV ===), analyse-le en priorité plutôt que les données du profil ci-dessus.

Tu peux aider sur: l'analyse de profil, les recommandations d'entreprises et postes, les compétences à développer, la stratégie de recherche, l'amélioration des candidatures, les programmes (Graduate, VIE, etc.).

RAPPEL CRUCIAL: Réponds comme un humain dans une conversation normale. Pas de listes à puces, pas d'emojis, pas de structure robotique. Juste une discussion naturelle et des conseils personnalisés.`;

  return prompt;
}

export interface AssistantMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function generateAssistantResponse(
  messages: AssistantMessage[],
  context: UserContext,
  model?: string
): Promise<string> {
  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage.content.toLowerCase();
  const originalMessage = lastMessage.content;
  
  // Extraire le contexte de page si présent
  const pageContextMatch = lastMessage.content.match(/\[Contexte: ([^\]]+)\]/);
  const pageContext = pageContextMatch ? pageContextMatch[1] : "";
  
  // Nettoyer le message du contexte pour l'analyse
  const cleanMessage = originalMessage.replace(/\[Contexte: [^\]]+\]\s*/g, '').trim();

  // Toutes les requêtes passent par GPT
  try {
    const conversationHistory = messages
      .filter(m => m.role !== 'system')
      .slice(-5) // Garder les 5 derniers messages pour le contexte
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    
    const userContextForAI = {
      skills: context.skills.map(s => s.name),
      targetRole: context.profile?.domains || undefined,
      experience: context.resumes[0]?.experience || undefined,
    };
    
    const aiResponse = await callOpenRouterChat(
      cleanMessage,
      conversationHistory,
      userContextForAI,
      model
    );
    
    return aiResponse;
  } catch (error) {
    console.error('OpenRouter AI failed, using fallback:', error);
    // Fallback sur réponse conversationnelle si l'API échoue
    return generateConversationalResponse(cleanMessage, context);
  }
}

// Fallback simple si l'API échoue
function generateConversationalResponse(message: string, context: UserContext): string {
  return `Désolé, je rencontre un problème technique. Réessaie dans quelques instants ou reformule ta question.`;
}

