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

export function generateSystemPrompt(context: UserContext, language: string = 'en'): string {
  const { profile, skills, resumes, applications, careerObjectives, aiInsights } = context;

  // If context is empty, it means a CV was provided directly
  const hasStoredProfile = profile || skills.length > 0 || resumes.length > 0;

  let prompt = `You are an experienced and caring career advisor. You speak naturally and humanly, like a mentor discussing with a student.

ABSOLUTE COMMUNICATION RULES:
- Respond conversationally and naturally, as in a real discussion
- NEVER use emojis, emoticons or decorative symbols (no 💡, 🎯, ✨, etc.)
- Avoid systematic bullet lists - prefer flowing paragraphs
- Don't structure your responses with uppercase titles or rigid sections
- Speak in first person ("I suggest...", "In my opinion...")
- Be warm but professional
- Give personalized advice, not generic responses

LANGUAGE DIRECTIVE:
${language === 'fr'
      ? 'You MUST respond EXCLUSIVELY in FRENCH, even if the system prompt contains English. If the user speaks English, respond in FRENCH.'
      : 'You MUST respond EXCLUSIVELY in ENGLISH. Even if the user speaks French, your output must be in ENGLISH.'}

`;

  if (!hasStoredProfile) {
    prompt += `IMPORTANT: The user will provide their CV content directly in their message.
Analyze ONLY this provided CV. Make NO assumptions about their profile.

When analyzing a CV, you MUST:
1. EXTRACT AND SUMMARIZE the candidate's profile:
   - Full name and contact info (if present)
   - Current education level, school, and field of study
   - Total years of experience
   - Key professional experiences (companies, roles, durations)
   - Technical and soft skills identified
   - Languages spoken with proficiency levels
   - Notable achievements or certifications

2. PROVIDE A PROFESSIONAL ASSESSMENT:
   - Overall CV quality score (out of 10)
   - 3 main strengths of this profile
   - 3 areas for improvement
   - Types of roles this candidate is best suited for
   - Industries/sectors that would value this profile

3. GIVE ACTIONABLE RECOMMENDATIONS:
   - Specific improvements for the CV format/content
   - Skills to develop or highlight more
   - Types of companies to target
   - Search strategy tailored to their profile

Base your analysis EXCLUSIVELY on the CV content provided. Be specific and reference actual content from their CV.

`;
  } else {
    prompt += `USER PROFILE:
`;
  }

  if (profile) {
    if (profile.schoolName) prompt += `- School: ${profile.schoolName}\n`;
    if (profile.educationLevel) prompt += `- Education level: ${profile.educationLevel}\n`;
    if (profile.specialty) prompt += `- Specialty: ${profile.specialty}\n`;
    if (profile.preferredCities) prompt += `- Preferred cities: ${profile.preferredCities}\n`;
    if (profile.contractTypes) prompt += `- Contract types: ${profile.contractTypes}\n`;
    if (profile.domains) prompt += `- Areas of interest: ${profile.domains}\n`;
    if (profile.languages) prompt += `- Languages: ${profile.languages}\n`;
  }

  if (skills.length > 0) {
    prompt += `\nSKILLS:\n`;
    skills.forEach((skill) => {
      prompt += `- ${skill.name}`;
      if (skill.level) prompt += ` (${skill.level})`;
      if (skill.category) prompt += ` [${skill.category}]`;
      prompt += `\n`;
    });
  }

  if (resumes.length > 0 && resumes[0]) {
    const resume = resumes[0];
    if (resume.experience) prompt += `\nEXPERIENCE:\n${resume.experience}\n`;
    if (resume.education) prompt += `\nEDUCATION:\n${resume.education}\n`;
  }

  if (applications.length > 0) {
    prompt += `\nRECENT APPLICATIONS:\n`;
    applications.slice(0, 5).forEach((app) => {
      prompt += `- ${app.jobTitle} at ${app.companyName} (${app.status})\n`;
    });
  }

  // Add career objectives
  if (careerObjectives && careerObjectives.length > 0) {
    prompt += `\nCAREER OBJECTIVES:\n`;
    careerObjectives.forEach((obj) => {
      prompt += `- ${obj.objective}\n`;
      if (obj.targetRoles) {
        try {
          const roles = JSON.parse(obj.targetRoles);
          if (Array.isArray(roles) && roles.length > 0) {
            prompt += `  Target positions: ${roles.join(', ')}\n`;
          }
        } catch { }
      }
      if (obj.targetSectors) {
        try {
          const sectors = JSON.parse(obj.targetSectors);
          if (Array.isArray(sectors) && sectors.length > 0) {
            prompt += `  Sectors: ${sectors.join(', ')}\n`;
          }
        } catch { }
      }
      if (obj.targetCompanies) {
        try {
          const companies = JSON.parse(obj.targetCompanies);
          if (Array.isArray(companies) && companies.length > 0) {
            prompt += `  Target companies: ${companies.join(', ')}\n`;
          }
        } catch { }
      }
      if (obj.timeline) prompt += `  Timeline: ${obj.timeline}\n`;
    });
  }

  // Add previous insights for continuity
  if (aiInsights && aiInsights.length > 0) {
    prompt += `\nPREVIOUS ADVICE GIVEN:\n`;
    const recentInsights = aiInsights.slice(0, 5);
    recentInsights.forEach((insight) => {
      const typeLabels: Record<string, string> = {
        'company_recommendation': 'Recommended companies',
        'cv_improvement': 'CV improvement',
        'skill_suggestion': 'Suggested skills',
        'strategy': 'Strategy',
        'interview_tip': 'Interview tip',
      };
      prompt += `- [${typeLabels[insight.type] || insight.type}]: ${insight.content.slice(0, 100)}...\n`;
    });
    prompt += `\nConsider these previous tips to ensure continuity and avoid repetition.\n`;
  }

  prompt += `
If the user provides their CV (between === MY CV CONTENT === and === END OF CV ===), prioritize analyzing it over the profile data above. When a CV is provided, ALWAYS start by extracting and summarizing the key information before giving advice.

You can help with: CV analysis and improvement, profile assessment, company and position recommendations, skills to develop, search strategy, improving applications, interview preparation, programs (Graduate, VIE, internships, etc.).

IMPORTANT: When analyzing a CV, be thorough and specific. Reference actual content from their CV. Don't give generic advice - make it personal to their actual experience and skills.

Respond like a human career coach having a real conversation. Be direct, insightful, and actionable.`;

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

// Simple fallback if API fails
function generateConversationalResponse(message: string, context: UserContext): string {
  return `Sorry, I'm experiencing a technical issue. Please try again in a few moments or rephrase your question.`;
}

