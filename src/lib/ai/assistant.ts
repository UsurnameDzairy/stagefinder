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
}

export async function getUserContext(userId: string): Promise<UserContext> {
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

  return {
    profile: user.profile,
    skills: user.skills,
    resumes: user.resumes,
    applications: user.applications,
    savedOffers: user.savedOffers.length,
  };
}

export function generateSystemPrompt(context: UserContext): string {
  const { profile, skills, resumes, applications } = context;

  let prompt = `Tu es un assistant IA expert en orientation de carrière et recherche de stage/emploi. Tu aides les étudiants et jeunes diplômés à trouver les meilleures opportunités selon leur profil.

PROFIL DE L'UTILISATEUR:
`;

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

  prompt += `\nTON RÔLE:
1. Analyser le profil de l'utilisateur et identifier ses forces
2. Recommander des types de postes et entreprises adaptés
3. Suggérer des compétences à développer
4. Conseiller sur la stratégie de recherche (secteurs, entreprises cibles)
5. Donner des conseils pour améliorer les candidatures
6. Proposer des programmes spécifiques (Graduate Programs, VIE, etc.)

Sois concis, précis et actionnable. Utilise des exemples concrets d'entreprises et de postes disponibles dans notre base de données.`;

  return prompt;
}

export interface AssistantMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function generateAssistantResponse(
  messages: AssistantMessage[],
  context: UserContext
): Promise<string> {
  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage.content.toLowerCase();
  const originalMessage = lastMessage.content;
  
  // Extraire le contexte de page si présent
  const pageContextMatch = lastMessage.content.match(/\[Contexte: ([^\]]+)\]/);
  const pageContext = pageContextMatch ? pageContextMatch[1] : "";
  
  // Nettoyer le message du contexte pour l'analyse
  const cleanMessage = originalMessage.replace(/\[Contexte: [^\]]+\]\s*/g, '').trim();

  // ============================================
  // RÉPONSES CONVERSATIONNELLES NATURELLES
  // ============================================
  
  // Questions sur le CV / copier-coller
  if (
    userMessage.includes("copier") || 
    userMessage.includes("coller") ||
    userMessage.includes("juste copié") ||
    userMessage.includes("copie") ||
    (userMessage.includes("cv") && (userMessage.includes("là") || userMessage.includes("ça")))
  ) {
    return `Je comprends ta remarque ! 😊 En fait, ce que tu vois à gauche c'est ton CV original, et à droite c'est la version que je peux t'aider à améliorer.

**Ce que je peux faire pour toi :**

1. **Reformuler tes expériences** avec un vocabulaire plus impactant (style Harvard/McKinsey)
2. **Mettre en valeur tes compétences** de manière plus percutante
3. **Optimiser la structure** pour les ATS (systèmes de tri automatique)
4. **Adapter le ton** selon le secteur visé (finance, tech, conseil...)

**Dis-moi ce que tu veux améliorer :**
- "Améliore mon résumé professionnel"
- "Reformule mes expériences"
- "Rends mon CV plus impactant pour la finance"
- "Ajoute des verbes d'action"

Qu'est-ce qui t'intéresse ? 🎯`;
  }

  // Salutations
  if (
    userMessage.match(/^(salut|hello|bonjour|hey|coucou|yo|hi)\s*[!?.]?$/i) ||
    userMessage.includes("ça va") ||
    userMessage.includes("comment vas")
  ) {
    const name = context.profile?.schoolName ? ` ! Je vois que tu es à ${context.profile.schoolName}` : "";
    return `Salut${name} ! 👋

Je suis là pour t'aider avec ta recherche de stage/emploi. Qu'est-ce que je peux faire pour toi aujourd'hui ?

Tu peux me demander :
• D'analyser ton profil
• De te recommander des entreprises
• D'améliorer ton CV
• De te donner des conseils stratégiques

Dis-moi tout ! 😊`;
  }

  // Remerciements
  if (
    userMessage.match(/^(merci|thanks|thx|cool|super|parfait|génial|top)\s*[!?.]?$/i)
  ) {
    return `Avec plaisir ! 😊 N'hésite pas si tu as d'autres questions. Je suis là pour t'aider à décrocher le stage/job de tes rêves ! 🚀`;
  }

  // Questions sur l'assistant lui-même
  if (
    userMessage.includes("qui es-tu") ||
    userMessage.includes("tu es qui") ||
    userMessage.includes("c'est quoi") ||
    userMessage.includes("tu fais quoi") ||
    userMessage.includes("tu peux faire")
  ) {
    return `Je suis ton assistant carrière IA ! 🤖✨

**Mon job c'est de t'aider à :**

🎯 **Trouver le bon stage/emploi**
- Analyser ton profil et tes compétences
- Te recommander des entreprises qui matchent
- Te suggérer des postes adaptés

📝 **Améliorer tes candidatures**
- Optimiser ton CV (vocabulaire Harvard, verbes d'action)
- T'aider avec tes lettres de motivation
- Te préparer aux entretiens

📊 **Définir ta stratégie**
- Identifier tes forces et axes d'amélioration
- Créer un plan d'action personnalisé
- Te donner des conseils sectoriels (finance, tech, conseil...)

Je connais ton profil, tes compétences et tes candidatures. Pose-moi n'importe quelle question ! 💪`;
  }

  // Questions générales / incompréhension
  if (
    userMessage.includes("quoi") ||
    userMessage.includes("hein") ||
    userMessage.includes("comprends pas") ||
    userMessage.includes("c'est quoi ça")
  ) {
    return `Pas de souci, je t'explique ! 😊

Tu es sur **StageFinder**, une app qui t'aide à trouver des stages et emplois. 

**Sur cette page (CV Improver) :**
- À gauche : ton CV original
- À droite : la version améliorée que je peux générer

**Ce que tu peux faire :**
1. Clique sur "Améliorer avec vocabulaire Harvard" pour upgrader ton CV
2. Pose-moi des questions sur ta recherche d'emploi
3. Demande-moi des conseils personnalisés

Qu'est-ce que tu veux savoir ? 🎯`;
  }

  // Questions sur l'amélioration du CV
  if (
    userMessage.includes("améliorer") ||
    userMessage.includes("ameliorer") ||
    userMessage.includes("améliore") ||
    userMessage.includes("upgrade") ||
    userMessage.includes("mieux")
  ) {
    return `Super, je vais t'aider à améliorer ton CV ! 🚀

**Voici ce que je te propose :**

1. **Vocabulaire Harvard/McKinsey**
   - "Managed" → "Spearheaded"
   - "Helped" → "Facilitated"
   - "Made" → "Engineered"

2. **Quantifier tes résultats**
   - "Augmenté les ventes" → "Increased sales by 25% ($50K revenue)"
   - "Géré une équipe" → "Led cross-functional team of 5 members"

3. **Structure optimisée**
   - Action verb + Task + Result (méthode STAR)
   - Bullet points percutants
   - Mots-clés pour les ATS

**Clique sur le bouton "Améliorer avec vocabulaire Harvard"** pour voir la magie opérer ! ✨

Ou dis-moi quelle partie spécifique tu veux améliorer (résumé, expériences, compétences...) ?`;
  }

  // Analyse de page spécifique
  if (pageContext.includes("page Offres")) {
    return analyzeOffersPage(context, userMessage);
  }
  
  if (pageContext.includes("page Candidatures")) {
    return analyzeCandidaturesPage(context, userMessage);
  }
  
  if (pageContext.includes("Dashboard")) {
    return analyzeDashboard(context, userMessage);
  }
  
  if (pageContext.includes("Paramètres")) {
    return analyzeSettingsPage(context, userMessage);
  }

  // Analyse du profil
  if (
    userMessage.includes("profil") ||
    userMessage.includes("analyse") ||
    userMessage.includes("évaluer") ||
    userMessage.includes("forces")
  ) {
    return generateProfileAnalysis(context);
  }

  // Recommandations d'entreprises
  if (
    userMessage.includes("entreprise") ||
    userMessage.includes("société") ||
    userMessage.includes("où postuler") ||
    userMessage.includes("boîte") ||
    userMessage.includes("boite")
  ) {
    return generateCompanyRecommendations(context);
  }

  // Recommandations de postes
  if (
    userMessage.includes("poste") ||
    userMessage.includes("stage") ||
    userMessage.includes("opportunité") ||
    userMessage.includes("job") ||
    userMessage.includes("emploi")
  ) {
    return generateJobRecommendations(context);
  }

  // Conseils sur les compétences
  if (
    userMessage.includes("compétence") ||
    userMessage.includes("skill") ||
    userMessage.includes("apprendre") ||
    userMessage.includes("formation")
  ) {
    return generateSkillsAdvice(context);
  }

  // Stratégie de recherche
  if (
    userMessage.includes("stratégie") ||
    userMessage.includes("comment") ||
    userMessage.includes("conseil") ||
    userMessage.includes("aide")
  ) {
    return generateSearchStrategy(context);
  }

  // Entretiens
  if (
    userMessage.includes("entretien") ||
    userMessage.includes("interview") ||
    userMessage.includes("préparer")
  ) {
    return generateInterviewAdvice(context);
  }

  // Lettre de motivation
  if (
    userMessage.includes("lettre") ||
    userMessage.includes("motivation") ||
    userMessage.includes("cover letter")
  ) {
    return `Pour ta lettre de motivation, voici mes conseils ! 📝

**Structure gagnante :**

1. **Accroche percutante** (2-3 lignes)
   - Pourquoi cette entreprise spécifiquement
   - Ce qui te motive dans le poste

2. **Ton parcours** (1 paragraphe)
   - Tes expériences les plus pertinentes
   - Tes compétences clés pour le poste

3. **Ce que tu apportes** (1 paragraphe)
   - Valeur ajoutée concrète
   - Exemples de réalisations

4. **Conclusion** (2-3 lignes)
   - Réitérer ta motivation
   - Appel à l'action

**💡 Astuce :** Va sur la page "Lettres" pour générer une lettre personnalisée automatiquement !

Tu veux que je t'aide avec une lettre spécifique ? Dis-moi l'entreprise et le poste ! 🎯`;
  }

  // Pour les questions complexes, utiliser OpenRouter AI
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
      userContextForAI
    );
    
    return aiResponse;
  } catch (error) {
    console.error('OpenRouter AI failed, using fallback:', error);
    // Fallback sur réponse conversationnelle si l'API échoue
    return generateConversationalResponse(cleanMessage, context);
  }
}

// Nouvelle fonction pour les réponses conversationnelles
function generateConversationalResponse(message: string, context: UserContext): string {
  const { profile, skills, applications } = context;
  
  // Construire une réponse personnalisée basée sur le contexte
  let response = `Je suis là pour t'aider ! 😊\n\n`;
  
  if (message.length < 10) {
    response += `Tu peux me poser n'importe quelle question sur :\n\n`;
  } else {
    response += `Je n'ai pas bien compris ta question, mais je peux t'aider avec :\n\n`;
  }
  
  response += `📊 **Ton profil** - "Analyse mon profil", "Quelles sont mes forces ?"\n`;
  response += `🏢 **Entreprises** - "Quelles entreprises me recommandes-tu ?"\n`;
  response += `💼 **Postes** - "Quels stages correspondent à mon profil ?"\n`;
  response += `📝 **CV** - "Comment améliorer mon CV ?"\n`;
  response += `✉️ **Lettres** - "Aide-moi avec ma lettre de motivation"\n`;
  response += `🎯 **Stratégie** - "Quelle stratégie adopter ?"\n\n`;
  
  // Ajouter un conseil personnalisé
  if (applications.length === 0) {
    response += `💡 **Mon conseil :** Tu n'as pas encore de candidatures. Commence par explorer les offres sur la page "Offres" !`;
  } else if (skills.length < 5) {
    response += `💡 **Mon conseil :** Ajoute plus de compétences à ton profil pour améliorer les recommandations !`;
  } else {
    response += `💡 **Mon conseil :** Tu as ${skills.length} compétences et ${applications.length} candidatures. Continue comme ça ! 🚀`;
  }
  
  return response;
}

// Nouvelle fonction pour les conseils d'entretien
function generateInterviewAdvice(context: UserContext): string {
  const { profile } = context;
  
  let advice = `🎤 **Préparation aux entretiens**\n\n`;
  
  advice += `**Les 3 types de questions à préparer :**\n\n`;
  
  advice += `1. **Questions "Fit" (comportementales)**\n`;
  advice += `   - "Parlez-moi de vous" (pitch 2 min)\n`;
  advice += `   - "Pourquoi cette entreprise ?"\n`;
  advice += `   - "Vos forces/faiblesses ?"\n`;
  advice += `   - "Un défi que vous avez surmonté ?"\n\n`;
  
  advice += `2. **Questions techniques**\n`;
  if (profile?.domains?.toLowerCase().includes("finance")) {
    advice += `   - Valorisation d'entreprise (DCF, multiples)\n`;
    advice += `   - Analyse de marché\n`;
    advice += `   - Actualité financière\n\n`;
  } else {
    advice += `   - Questions sur tes compétences techniques\n`;
    advice += `   - Cas pratiques\n`;
    advice += `   - Projets réalisés\n\n`;
  }
  
  advice += `3. **Questions de motivation**\n`;
  advice += `   - "Où vous voyez-vous dans 5 ans ?"\n`;
  advice += `   - "Pourquoi ce secteur ?"\n`;
  advice += `   - "Vos questions pour nous ?"\n\n`;
  
  advice += `**💡 Méthode STAR pour répondre :**\n`;
  advice += `- **S**ituation : Contexte\n`;
  advice += `- **T**ask : Ta mission\n`;
  advice += `- **A**ction : Ce que tu as fait\n`;
  advice += `- **R**esult : Résultats concrets\n\n`;
  
  advice += `Tu veux que je t'aide à préparer une question spécifique ? 🎯`;
  
  return advice;
}

function analyzeOffersPage(context: UserContext, userMessage: string): string {
  const { skills, profile, savedOffers } = context;
  
  let analysis = `🔍 **Analyse de la page Offres**\n\n`;
  
  analysis += `**📊 Votre situation:**\n`;
  analysis += `- ${skills.length} compétences dans votre profil\n`;
  analysis += `- ${savedOffers} offres sauvegardées\n`;
  
  if (profile?.domains) {
    analysis += `- Domaines ciblés: ${profile.domains}\n`;
  }
  
  analysis += `\n**💡 Conseils pour optimiser votre recherche:**\n\n`;
  
  analysis += `1. **Utilisez les filtres intelligents**\n`;
  analysis += `   - Filtrez par type de contrat (Stage, Alternance, CDI)\n`;
  analysis += `   - Sélectionnez vos villes préférées\n`;
  analysis += `   - Activez les sources pertinentes (LinkedIn, Indeed)\n\n`;
  
  analysis += `2. **Analysez les scores de match**\n`;
  analysis += `   - Les offres avec 80%+ sont très adaptées à votre profil\n`;
  analysis += `   - Priorisez les offres récentes (< 7 jours)\n`;
  analysis += `   - Regardez les compétences demandées vs les vôtres\n\n`;
  
  analysis += `3. **Exportez vos données**\n`;
  analysis += `   - Utilisez "Entreprises CSV" pour analyser les tendances\n`;
  analysis += `   - Créez votre liste d'entreprises cibles\n\n`;
  
  analysis += `4. **Configurez des alertes**\n`;
  analysis += `   - Allez dans Paramètres > Alertes emploi\n`;
  analysis += `   - Créez des alertes pour vos domaines préférés\n`;
  analysis += `   - Recevez des notifications pour les nouvelles offres\n\n`;
  
  if (savedOffers === 0) {
    analysis += `⚠️ **Action:** Commencez par sauvegarder quelques offres intéressantes pour les analyser plus tard !`;
  } else {
    analysis += `✅ **Bon départ:** Vous avez ${savedOffers} offres sauvegardées. Pensez à postuler rapidement !`;
  }
  
  return analysis;
}

function analyzeCandidaturesPage(context: UserContext, userMessage: string): string {
  const { applications } = context;
  
  let analysis = `📝 **Analyse de vos candidatures**\n\n`;
  
  analysis += `**📊 Statistiques:**\n`;
  analysis += `- ${applications.length} candidatures en cours\n`;
  
  const statusCount: Record<string, number> = {};
  applications.forEach(app => {
    statusCount[app.status] = (statusCount[app.status] || 0) + 1;
  });
  
  Object.entries(statusCount).forEach(([status, count]) => {
    analysis += `- ${status}: ${count}\n`;
  });
  
  analysis += `\n**💡 Conseils pour gérer vos candidatures:**\n\n`;
  
  analysis += `1. **Générez des lettres de motivation**\n`;
  analysis += `   - Utilisez le générateur avec style "Harvard"\n`;
  analysis += `   - Personnalisez pour chaque entreprise\n`;
  analysis += `   - Activez le mode bilingue (FR/EN) si besoin\n\n`;
  
  analysis += `2. **Suivez vos candidatures**\n`;
  analysis += `   - Notez les dates d'envoi\n`;
  analysis += `   - Relancez après 2 semaines\n`;
  analysis += `   - Préparez vos entretiens\n\n`;
  
  analysis += `3. **Améliorez votre CV**\n`;
  analysis += `   - Allez dans CV Improver\n`;
  analysis += `   - Analysez votre CV actuel\n`;
  analysis += `   - Utilisez le vocabulaire Harvard\n\n`;
  
  if (applications.length === 0) {
    analysis += `⚠️ **Commencez maintenant:** Allez sur la page Offres et postulez à vos premières opportunités !`;
  } else if (applications.length < 5) {
    analysis += `📈 **Augmentez le volume:** Visez 10-15 candidatures pour maximiser vos chances.`;
  } else {
    analysis += `✅ **Excellent rythme:** Continuez et préparez vos entretiens !`;
  }
  
  return analysis;
}

function analyzeDashboard(context: UserContext, userMessage: string): string {
  const { applications, savedOffers, skills } = context;
  
  let analysis = `📊 **Analyse de votre Dashboard**\n\n`;
  
  analysis += `**🎯 Vue d'ensemble:**\n`;
  analysis += `- ${applications.length} candidatures actives\n`;
  analysis += `- ${savedOffers} offres sauvegardées\n`;
  analysis += `- ${skills.length} compétences enregistrées\n\n`;
  
  analysis += `**💡 Prochaines actions recommandées:**\n\n`;
  
  if (skills.length < 5) {
    analysis += `1. ⚠️ **Complétez votre profil**\n`;
    analysis += `   - Ajoutez plus de compétences (minimum 5-10)\n`;
    analysis += `   - Uploadez votre CV pour extraction automatique\n\n`;
  }
  
  if (savedOffers > 0 && applications.length === 0) {
    analysis += `2. 🚀 **Passez à l'action**\n`;
    analysis += `   - Vous avez ${savedOffers} offres sauvegardées\n`;
    analysis += `   - Commencez à postuler dès aujourd'hui !\n\n`;
  }
  
  if (applications.length > 0) {
    analysis += `3. 📧 **Suivez vos candidatures**\n`;
    analysis += `   - Vérifiez les réponses reçues\n`;
    analysis += `   - Relancez si pas de retour après 2 semaines\n\n`;
  }
  
  analysis += `4. 🔍 **Continuez votre recherche**\n`;
  analysis += `   - Lancez une nouvelle recherche sur la page Offres\n`;
  analysis += `   - Configurez des alertes pour être notifié\n`;
  
  return analysis;
}

function analyzeSettingsPage(context: UserContext, userMessage: string): string {
  const { profile, skills } = context;
  
  let analysis = `⚙️ **Analyse de votre profil**\n\n`;
  
  analysis += `**✅ Éléments complétés:**\n`;
  if (profile?.schoolName) analysis += `- École: ${profile.schoolName}\n`;
  if (profile?.educationLevel) analysis += `- Niveau: ${profile.educationLevel}\n`;
  if (profile?.domains) analysis += `- Domaines: ${profile.domains}\n`;
  if (skills.length > 0) analysis += `- Compétences: ${skills.length}\n`;
  
  analysis += `\n**⚠️ À compléter pour améliorer vos résultats:**\n\n`;
  
  if (!profile?.preferredCities) {
    analysis += `- **Villes préférées:** Ajoutez vos localisations cibles\n`;
  }
  
  if (!profile?.contractTypes) {
    analysis += `- **Types de contrat:** Spécifiez Stage, Alternance, CDI...\n`;
  }
  
  if (skills.length < 10) {
    analysis += `- **Compétences:** Ajoutez plus de skills (${10 - skills.length} manquantes)\n`;
  }
  
  analysis += `\n**💡 Fonctionnalités à utiliser:**\n\n`;
  
  analysis += `1. **Alertes emploi** (section ci-dessous)\n`;
  analysis += `   - Créez des alertes personnalisées\n`;
  analysis += `   - Recevez des notifications automatiques\n`;
  analysis += `   - Configurez la fréquence (instantané, quotidien)\n\n`;
  
  analysis += `2. **Upload CV**\n`;
  analysis += `   - Extraction automatique des compétences\n`;
  analysis += `   - Analyse de votre expérience\n`;
  analysis += `   - Suggestions d'amélioration\n\n`;
  
  analysis += `3. **Export de données**\n`;
  analysis += `   - Téléchargez vos données (RGPD)\n`;
  analysis += `   - Analysez votre progression\n`;
  
  return analysis;
}

function generateProfileAnalysis(context: UserContext): string {
  const { profile, skills, applications } = context;
  
  let analysis = `📊 **Analyse de votre profil**\n\n`;

  // Points forts
  analysis += `✅ **Points forts:**\n`;
  if (profile?.schoolName) {
    analysis += `- Formation solide: ${profile.schoolName}\n`;
  }
  if (skills.length > 5) {
    analysis += `- Large palette de compétences (${skills.length} compétences)\n`;
  }
  if (applications.length > 0) {
    analysis += `- Démarche active (${applications.length} candidatures)\n`;
  }

  // Recommandations
  analysis += `\n💡 **Recommandations:**\n`;
  
  const techSkills = skills.filter(s => 
    s.category?.toLowerCase().includes("tech") || 
    ["javascript", "python", "react", "sql"].some(t => s.name.toLowerCase().includes(t))
  );
  
  if (techSkills.length > 0) {
    analysis += `- Profil technique fort → Ciblez les départements Tech/Quant des banques\n`;
    analysis += `- Entreprises recommandées: Goldman Sachs (Engineering), JP Morgan (Technology)\n`;
  }

  if (profile?.domains?.toLowerCase().includes("finance")) {
    analysis += `- Intérêt pour la finance → Explorez les programmes Graduate en Investment Banking\n`;
    analysis += `- Cibles: BNP Paribas CIB, Société Générale, Rothschild & Co\n`;
  }

  analysis += `\n🎯 **Prochaines étapes:**\n`;
  analysis += `1. Complétez votre profil avec vos expériences détaillées\n`;
  analysis += `2. Uploadez votre CV pour une analyse approfondie\n`;
  analysis += `3. Explorez les offres des entreprises recommandées\n`;

  return analysis;
}

function generateCompanyRecommendations(context: UserContext): string {
  const { profile, skills } = context;
  
  let reco = `🏢 **Entreprises recommandées pour vous**\n\n`;

  const hasTechSkills = skills.some(s => 
    ["javascript", "python", "java", "react", "sql"].some(t => 
      s.name.toLowerCase().includes(t)
    )
  );

  const hasFinanceInterest = profile?.domains?.toLowerCase().includes("finance") ||
    profile?.specialty?.toLowerCase().includes("finance");

  if (hasTechSkills && hasFinanceInterest) {
    reco += `**🎯 Top Match - Fintech & Tech Finance:**\n`;
    reco += `1. **Goldman Sachs** - Engineering Division (Summer Analyst)\n`;
    reco += `2. **JP Morgan** - Technology Program (Graduate)\n`;
    reco += `3. **BNP Paribas** - Digital Banking (VIE)\n\n`;
  }

  if (hasFinanceInterest) {
    reco += `**💼 Investment Banking:**\n`;
    reco += `1. **Rothschild & Co** - M&A Summer Internship\n`;
    reco += `2. **Lazard** - Graduate Program\n`;
    reco += `3. **Morgan Stanley** - Summer Analyst\n\n`;
  }

  if (hasTechSkills) {
    reco += `**💻 Pure Tech:**\n`;
    reco += `1. **Google** - Software Engineering Internship\n`;
    reco += `2. **Meta** - Product Engineering\n`;
    reco += `3. **Microsoft** - Explore Program\n\n`;
  }

  reco += `💡 **Conseil:** Postulez tôt ! Les programmes Graduate ouvrent généralement en septembre pour l'année suivante.`;

  return reco;
}

function generateJobRecommendations(context: UserContext): string {
  const { profile, skills } = context;
  
  let reco = `💼 **Postes recommandés**\n\n`;

  const level = profile?.educationLevel?.toLowerCase() || "";
  const domains = profile?.domains?.toLowerCase() || "";

  if (level.includes("master") || level.includes("m2")) {
    reco += `**Graduate Programs (Bac+5):**\n`;
    reco += `- Investment Banking Graduate Program\n`;
    reco += `- Quantitative Research Analyst\n`;
    reco += `- Management Consulting Associate\n\n`;
  } else {
    reco += `**Stages & Internships:**\n`;
    reco += `- Summer Analyst (6 mois)\n`;
    reco += `- Spring Week (1-2 semaines)\n`;
    reco += `- Stage de fin d'études\n\n`;
  }

  if (domains.includes("tech")) {
    reco += `**Tech Roles:**\n`;
    reco += `- Software Engineering Intern\n`;
    reco += `- Data Analyst Intern\n`;
    reco += `- Product Manager Intern\n\n`;
  }

  if (domains.includes("finance")) {
    reco += `**Finance Roles:**\n`;
    reco += `- M&A Analyst\n`;
    reco += `- Sales & Trading Intern\n`;
    reco += `- Risk Management Analyst\n\n`;
  }

  reco += `🔍 Utilisez le scraper pour voir toutes les offres disponibles !`;

  return reco;
}

function generateSkillsAdvice(context: UserContext): string {
  const { skills } = context;
  
  let advice = `🎯 **Développement des compétences**\n\n`;

  advice += `**Vos compétences actuelles:**\n`;
  skills.slice(0, 5).forEach(s => {
    advice += `- ${s.name}\n`;
  });

  advice += `\n**Compétences à développer pour la finance:**\n`;
  advice += `📊 **Techniques:**\n`;
  advice += `- Excel avancé (VBA, modélisation financière)\n`;
  advice += `- Python (pandas, numpy pour l'analyse de données)\n`;
  advice += `- SQL (requêtes complexes)\n`;
  advice += `- Bloomberg Terminal\n\n`;

  advice += `💼 **Soft Skills:**\n`;
  advice += `- Présentation & storytelling\n`;
  advice += `- Analyse critique\n`;
  advice += `- Travail sous pression\n`;
  advice += `- Anglais financier\n\n`;

  advice += `📚 **Ressources:**\n`;
  advice += `- Coursera: Financial Markets (Yale)\n`;
  advice += `- DataCamp: Python for Finance\n`;
  advice += `- Wall Street Prep: Financial Modeling\n`;

  return advice;
}

function generateSearchStrategy(context: UserContext): string {
  const { applications, savedOffers } = context;
  
  let strategy = `📈 **Stratégie de recherche optimale**\n\n`;

  strategy += `**📅 Timeline:**\n`;
  strategy += `- **Septembre-Octobre:** Ouverture des candidatures Graduate Programs\n`;
  strategy += `- **Novembre-Décembre:** Premiers entretiens\n`;
  strategy += `- **Janvier-Mars:** Offres finales\n`;
  strategy += `- **Été:** Summer Internships\n\n`;

  strategy += `**🎯 Plan d'action (4 semaines):**\n\n`;
  
  strategy += `**Semaine 1-2: Préparation**\n`;
  strategy += `- Optimiser votre CV (1 page, format ATS-friendly)\n`;
  strategy += `- Préparer 3 lettres de motivation types\n`;
  strategy += `- Identifier 20 entreprises cibles\n\n`;

  strategy += `**Semaine 3-4: Applications**\n`;
  strategy += `- Postuler à 5-10 offres par semaine\n`;
  strategy += `- Personnaliser chaque candidature\n`;
  strategy += `- Suivre vos candidatures dans l'app\n\n`;

  strategy += `**💡 Conseils:**\n`;
  strategy += `1. **Qualité > Quantité:** Mieux vaut 10 candidatures ciblées que 50 génériques\n`;
  strategy += `2. **Networking:** LinkedIn + événements écoles\n`;
  strategy += `3. **Relance:** Relancez après 2 semaines\n`;
  strategy += `4. **Préparation:** Préparez vos entretiens (cas pratiques, fit questions)\n\n`;

  if (applications.length === 0) {
    strategy += `⚠️ **Action immédiate:** Vous n'avez pas encore de candidatures. Commencez dès aujourd'hui !`;
  } else if (applications.length < 5) {
    strategy += `📊 **Statut:** ${applications.length} candidatures. Objectif: 10-15 pour maximiser vos chances.`;
  } else {
    strategy += `✅ **Bon rythme:** ${applications.length} candidatures. Continuez et préparez vos entretiens !`;
  }

  return strategy;
}
