// Traductions FR/EN pour StageFinder
// Vocabulaire Harvard optimisé pour les candidatures

export const translations = {
  fr: {
    // Navigation
    nav: {
      dashboard: "Dashboard",
      offers: "Offres",
      companies: "Entreprises",
      applications: "Candidatures",
      letters: "Lettres",
      cvImprover: "CV Improver",
      settings: "Paramètres",
      logout: "Déconnexion",
      viewProfile: "Voir le profil",
    },

    // Dashboard
    dashboard: {
      title: "Tableau de bord",
      welcome: "Bienvenue",
      stats: {
        applications: "Candidatures",
        interviews: "Entretiens",
        offers: "Offres reçues",
        pending: "En attente",
      },
      recentActivity: "Activité récente",
      quickActions: "Actions rapides",
    },

    // Offres
    offers: {
      title: "Offres pour vous",
      subtitle: "Recherche personnalisée basée sur votre profil",
      search: "Rechercher",
      searchPlaceholder: "Poste, compétence, entreprise...",
      location: "Lieu",
      locationPlaceholder: "Ville, région...",
      filters: "Filtres",
      contractTypes: "Types de contrat",
      sources: "Sources",
      results: "offres trouvées",
      sortedBy: "Triées par compatibilité avec votre profil",
      match: "match",
      apply: "Postuler",
      save: "Sauvegarder",
      viewDetails: "Voir détails",
      noResults: "Aucune offre trouvée. Essayez d'autres critères.",
      searching: "Recherche en cours",
      analyzingOffers: "Analyse des offres sur 4 plateformes",
      searchInProgress: "Recherche en cours...",
      searchComplete: "Recherche terminée!",
      startingSearch: "Démarrage de la recherche...",
      connectingPlatforms: "Connexion aux plateformes...",
      criteria: "Critères",
      realData: "Données 100% réelles",
      cancel: "Annuler",
      waiting: "En attente",
    },

    // Candidatures
    applications: {
      title: "Suivi Candidatures",
      subtitle: "Gérez vos candidatures et suivez leur progression",
      newApplication: "Nouvelle candidature",
      company: "Entreprise",
      position: "Poste",
      contactEmail: "Email contact",
      careerSite: "Site carrière",
      status: {
        notApplied: "Non postulé",
        applied: "Postulé",
        inProgress: "En cours",
        interview: "Entretien",
        offer: "Offre reçue",
        rejected: "Refusé",
        withdrawn: "Retiré",
      },
      stats: {
        total: "Total",
        applied: "Postulées",
        pending: "En attente",
        interviews: "Entretiens",
        offers: "Offres",
        rejected: "Refusées",
        successRate: "Taux succès",
      },
      cvUpload: {
        title: "Aucun CV uploadé",
        titleWithFile: "CV uploadé",
        description: "Uploadez votre CV pour des emails personnalisés",
        descriptionWithFile: "Votre CV sera utilisé pour personnaliser vos emails et lettres de motivation",
        upload: "Uploader CV",
        change: "Changer",
        reading: "Lecture...",
        unsupportedFormat: "Format non supporté. Utilisez PDF, TXT ou DOCX.",
        errorReading: "Erreur lors de la lecture du fichier",
        errorUploading: "Erreur lors de l'upload du fichier",
      },
      generateEmail: "Générer email",
      generateLetter: "Générer lettre",
      markAsSent: "Marquer comme envoyé",
      addNote: "Ajouter une note",
    },

    // CV Improver
    cvImprover: {
      title: "CV Improver",
      subtitle: "Analysez et améliorez votre CV avec le vocabulaire Harvard",
      tabs: {
        analyze: "Analyser",
        improve: "Améliorer",
        generate: "Générer",
        actionVerbs: "Verbes d'action",
      },
      yourCV: "Votre CV",
      uploadOrPaste: "Uploadez votre CV ou collez le contenu",
      clickToUpload: "Cliquez pour uploader votre CV",
      orPasteText: "ou collez le texte",
      pasteHere: "Collez le contenu de votre CV ici...",
      analyzeCV: "Analyser mon CV",
      results: "Résultats de l'analyse",
      score: "Score de votre CV",
      strengths: "Points forts",
      weaknesses: "Points à améliorer",
      suggestions: "Suggestions",
      pasteToAnalyze: "Collez votre CV pour obtenir une analyse",
    },

    // Lettres
    letters: {
      title: "Lettres de motivation",
      subtitle: "Générez des lettres stratégiques avec le vocabulaire Harvard",
      generate: "Générer une lettre",
      jobDescription: "Description de l'offre (Optionnel)",
      jobDescriptionPlaceholder: "Collez les points clés de l'offre pour une personnalisation chirurgicale...",
      placeholder: "Votre lettre de motivation optimisée par IA apparaîtra ici après traitement.",
      tone: {
        formal: "Formel",
        dynamic: "Dynamique",
        creative: "Créatif",
        harvard: "Harvard",
      },
      copy: "Copier",
      download: "Télécharger",
    },

    // Assistant Page
    assistantPage: {
      title: "Assistant Carrière IA",
      subtitle: "Conseils personnalisés basés sur votre profil",
      welcome: "Bonjour ! 👋 Je suis votre assistant carrière personnalisé.\n\nJe peux vous aider à :\n📊 Analyser votre profil et identifier vos forces\n🏢 Recommander les meilleures entreprises pour vous\n💼 Suggérer des postes adaptés à votre profil\n🎯 Développer vos compétences stratégiques\n📈 Optimiser votre stratégie de recherche\n\nQue souhaitez-vous savoir ?",
      quick: {
        analyze: "Analyse mon profil",
        companies: "Quelles entreprises me recommandes-tu ?",
        roles: "Quels postes correspondent à mon profil ?",
        skills: "Comment améliorer mes compétences ?",
        strategy: "Quelle stratégie de recherche adopter ?",
      },
      inputPlaceholder: "Posez votre question...",
      inputPlaceholderContinue: "Continuez la conversation...",
      suggestions: [
        "Analysez mon CV...",
        "Aidez-moi à rédiger une lettre...",
        "Simulons un entretien...",
        "Quelles sont mes compétences clés ?",
        "Optimisez mon profil LinkedIn..."
      ],
      starters: {
        cvAnalysis: "Analyse mon CV",
        interviewPrep: "Prépare mon entretien"
      },
      thinking: [
        "KAM analyse votre demande",
        "KAM réfléchit",
        "KAM élabore une réponse",
        "KAM traite l'information",
        "KAM prépare sa réponse"
      ]
    },

    // Emails
    emails: {
      types: {
        application: "Candidature",
        followUp: "Relance",
        thankYou: "Remerciement",
      },
      subject: "Objet",
      body: "Corps du message",
      copy: "Copier",
      markAsSent: "Marquer comme envoyé",
    },

    // Entreprises
    companies: {
      title: "Entreprises",
      subtitle: "Découvrez les entreprises qui recrutent",
      search: "Rechercher une entreprise...",
      sectors: "Secteurs",
      locations: "Localisations",
      size: "Taille",
      openPositions: "Postes ouverts",
      viewOffers: "Voir les offres",
    },

    // Paramètres
    settings: {
      title: "Paramètres",
      profile: "Profil",
      preferences: "Préférences",
      notifications: "Notifications",
      language: "Langue",
      theme: "Thème",
      save: "Enregistrer",
      saved: "Enregistré",
    },

    // Common
    common: {
      loading: "Chargement...",
      generating: "Rédaction en cours...",
      awaitingGeneration: "Awaiting Generation",
      result: "Rapport de Sortie",
      info: "Informations Stratégiques",
      error: "Erreur",
      success: "Succès",
      cancel: "Annuler",
      save: "Enregistrer",
      saved: "Sauvegardé",
      delete: "Supprimer",
      edit: "Modifier",
      create: "Créer",
      close: "Fermer",
      back: "Retour",
      next: "Suivant",
      previous: "Précédent",
      search: "Rechercher",
      filter: "Filtrer",
      sort: "Trier",
      all: "Tous",
      none: "Aucun",
      yes: "Oui",
      no: "Non",
      or: "ou",
      and: "et",
      skills: "Compétences",
      experience: "Expérience",
      education: "Formation",
      languages: "Langues",
      upload: "Uploader",
      change: "Changer",
      upgradeRequired: "Upgrade requis",
      upgradeMessage: "Passez à Student ou Pro pour accéder à toutes les offres",
      upgradePlan: "Améliorer mon plan",
      applicationsLeft: "candidatures restantes",
      upgrade: "Améliorer",
      goodMorning: "Bonjour",
      goodAfternoon: "Bon après-midi",
      goodEvening: "Bonsoir",
    },

    // Model Selector
    modelSelector: {
      title: "AGENTS IA",
      free: "GRATUIT",
      premium: "PREMIUM",
      models: {
        llama33: "Modèle puissant et rapide",
        llama31: "Ultra rapide pour les réponses simples",
        mixtral: "Excellent pour l'analyse de documents",
        gemma: "Modèle Google compact et efficace",
      },
    },

    // Vocabulaire Harvard pour les candidatures
    harvard: {
      verbs: {
        leadership: ["Piloté", "Orchestré", "Supervisé", "Coordonné", "Dirigé", "Mené", "Encadré"],
        achievement: ["Accompli", "Atteint", "Dépassé", "Réalisé", "Concrétisé", "Optimisé", "Maximisé"],
        analysis: ["Analysé", "Évalué", "Diagnostiqué", "Identifié", "Investigué", "Examiné", "Audité"],
        communication: ["Présenté", "Négocié", "Convaincu", "Articulé", "Communiqué", "Transmis", "Exposé"],
        creation: ["Conçu", "Développé", "Élaboré", "Créé", "Initié", "Lancé", "Fondé"],
        improvement: ["Amélioré", "Optimisé", "Rationalisé", "Restructuré", "Modernisé", "Transformé", "Renforcé"],
      },
      phrases: {
        intro: [
          "Fort(e) d'une solide expérience en",
          "Passionné(e) par",
          "Doté(e) d'une expertise reconnue en",
          "Animé(e) par une volonté constante de",
        ],
        skills: [
          "Maîtrise approfondie de",
          "Expertise avérée en",
          "Compétences pointues en",
          "Solide background en",
        ],
        motivation: [
          "Je souhaite mettre à profit mes compétences",
          "Je suis convaincu(e) de pouvoir apporter une réelle valeur ajoutée",
          "Mon objectif est de contribuer activement à",
          "Je suis déterminé(e) à relever les défis de",
        ],
      },
    },
  },

  en: {
    // Navigation
    nav: {
      dashboard: "Dashboard",
      offers: "Jobs",
      companies: "Companies",
      applications: "Applications",
      letters: "Cover Letters",
      cvImprover: "CV Improver",
      settings: "Settings",
      logout: "Logout",
      viewProfile: "View profile",
    },

    // Dashboard
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome",
      stats: {
        applications: "Applications",
        interviews: "Interviews",
        offers: "Offers received",
        pending: "Pending",
      },
      recentActivity: "Recent activity",
      quickActions: "Quick actions",
    },

    // Offers
    offers: {
      title: "Jobs for you",
      subtitle: "Personalized search based on your profile",
      search: "Search",
      searchPlaceholder: "Position, skill, company...",
      location: "Location",
      locationPlaceholder: "City, region...",
      filters: "Filters",
      contractTypes: "Contract types",
      sources: "Sources",
      results: "jobs found",
      sortedBy: "Sorted by compatibility with your profile",
      match: "match",
      apply: "Apply",
      save: "Save",
      viewDetails: "View details",
      noResults: "No jobs found. Try different criteria.",
      searching: "Searching",
      analyzingOffers: "Analyzing offers on 4 platforms",
      searchInProgress: "Search in progress...",
      searchComplete: "Search complete!",
      startingSearch: "Starting search...",
      connectingPlatforms: "Connecting to platforms...",
      criteria: "Criteria",
      realData: "100% real data",
      cancel: "Cancel",
      waiting: "Waiting",
    },

    // Applications
    applications: {
      title: "Application Tracker",
      subtitle: "Manage your applications and track their progress",
      newApplication: "New application",
      company: "Company",
      position: "Position",
      contactEmail: "Contact email",
      careerSite: "Career site",
      status: {
        notApplied: "Not applied",
        applied: "Applied",
        inProgress: "In progress",
        interview: "Interview",
        offer: "Offer received",
        rejected: "Rejected",
        withdrawn: "Withdrawn",
      },
      stats: {
        total: "Total",
        applied: "Applied",
        pending: "Pending",
        interviews: "Interviews",
        offers: "Offers",
        rejected: "Rejected",
        successRate: "Success rate",
      },
      cvUpload: {
        title: "No CV uploaded",
        titleWithFile: "CV uploaded",
        description: "Upload your CV for personalized emails",
        descriptionWithFile: "Your CV will be used to personalize your emails and cover letters",
        upload: "Upload CV",
        change: "Change",
        reading: "Reading...",
        unsupportedFormat: "Unsupported format. Use PDF, TXT or DOCX.",
        errorReading: "Error reading file",
        errorUploading: "Error uploading file",
      },
      generateEmail: "Generate email",
      generateLetter: "Generate letter",
      markAsSent: "Mark as sent",
      addNote: "Add note",
    },

    // CV Improver
    cvImprover: {
      title: "CV Improver",
      subtitle: "Analyze and improve your CV with Harvard vocabulary",
      tabs: {
        analyze: "Analyze",
        improve: "Improve",
        generate: "Generate",
        actionVerbs: "Action Verbs",
      },
      yourCV: "Your CV",
      uploadOrPaste: "Upload your CV or paste the content",
      clickToUpload: "Click to upload your CV",
      orPasteText: "or paste text",
      pasteHere: "Paste your CV content here...",
      analyzeCV: "Analyze my CV",
      results: "Analysis Results",
      score: "CV Score",
      strengths: "Strengths",
      weaknesses: "Areas to Improve",
      suggestions: "Suggestions",
      pasteToAnalyze: "Paste your CV to get an analysis",
    },

    // Letters
    letters: {
      title: "Cover Letters",
      subtitle: "Generate strategic letters with Harvard vocabulary",
      generate: "Generate a letter",
      jobDescription: "Job Description (Optional)",
      jobDescriptionPlaceholder: "Paste the job description for surgical personalization...",
      placeholder: "Your AI-optimized cover letter will appear here after processing.",
      tone: {
        formal: "Formal",
        dynamic: "Dynamic",
        creative: "Creative",
        harvard: "Harvard",
      },
      copy: "Copy",
      download: "Download",
    },

    // Assistant Page
    assistantPage: {
      title: "AI Career Assistant",
      subtitle: "Personalized advice based on your profile",
      welcome: "Hello! 👋 I am your personalized career assistant.\n\nI can help you:\n📊 Analyze your profile and identify your strengths\n🏢 Recommend the best companies for you\n💼 Suggest roles suited to your profile\n🎯 Develop your strategic skills\n📈 Optimize your search strategy\n\nWhat would you like to know?",
      quick: {
        analyze: "Analyze my profile",
        companies: "What companies do you recommend?",
        roles: "What roles match my profile?",
        skills: "How can I improve my skills?",
        strategy: "What search strategy should I adopt?",
      },
      inputPlaceholder: "Ask your question...",
      inputPlaceholderContinue: "Continue the conversation...",
      suggestions: [
        "Analyze my CV...",
        "Help me write a cover letter...",
        "Let's simulate an interview...",
        "What are my key skills?",
        "Optimize my LinkedIn profile..."
      ],
      starters: {
        cvAnalysis: "Analyze my CV",
        interviewPrep: "Prepare my interview"
      },
      thinking: [
        "KAM is analyzing your request",
        "KAM is thinking",
        "KAM is crafting a response",
        "KAM is processing",
        "KAM is preparing an answer"
      ]
    },

    // Emails
    emails: {
      types: {
        application: "Application",
        followUp: "Follow-up",
        thankYou: "Thank you",
      },
      subject: "Subject",
      body: "Message body",
      copy: "Copy",
      markAsSent: "Mark as sent",
    },

    // Companies
    companies: {
      title: "Companies",
      subtitle: "Discover companies that are hiring",
      search: "Search for a company...",
      sectors: "Sectors",
      locations: "Locations",
      size: "Size",
      openPositions: "Open positions",
      viewOffers: "View offers",
    },

    // Settings
    settings: {
      title: "Settings",
      profile: "Profile",
      preferences: "Preferences",
      notifications: "Notifications",
      language: "Language",
      theme: "Theme",
      save: "Save",
      saved: "Saved",
    },

    // Common
    common: {
      loading: "Loading...",
      generating: "Drafting in progress...",
      awaitingGeneration: "Awaiting Generation",
      result: "Output Report",
      info: "Strategic Information",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      saved: "Saved",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      all: "All",
      none: "None",
      yes: "Yes",
      no: "No",
      or: "or",
      and: "and",
      skills: "Skills",
      experience: "Experience",
      education: "Education",
      languages: "Languages",
      upload: "Upload",
      change: "Change",
      upgradeRequired: "Upgrade Required",
      upgradeMessage: "Upgrade to Student or Pro to access all job offers",
      upgradePlan: "Upgrade Plan",
      applicationsLeft: "applications left",
      upgrade: "Upgrade",
      goodMorning: "Good morning",
      goodAfternoon: "Good afternoon",
      goodEvening: "Good evening",
    },

    // Model Selector
    modelSelector: {
      title: "AI AGENTS",
      free: "FREE",
      premium: "PREMIUM",
      models: {
        llama33: "Powerful and fast model",
        llama31: "Ultra fast for simple responses",
        mixtral: "Excellent for document analysis",
        gemma: "Compact and efficient Google model",
      },
    },

    // Harvard vocabulary for applications
    harvard: {
      verbs: {
        leadership: ["Spearheaded", "Orchestrated", "Supervised", "Coordinated", "Directed", "Led", "Managed"],
        achievement: ["Accomplished", "Achieved", "Exceeded", "Delivered", "Realized", "Optimized", "Maximized"],
        analysis: ["Analyzed", "Evaluated", "Diagnosed", "Identified", "Investigated", "Examined", "Audited"],
        communication: ["Presented", "Negotiated", "Persuaded", "Articulated", "Communicated", "Conveyed", "Demonstrated"],
        creation: ["Designed", "Developed", "Crafted", "Created", "Initiated", "Launched", "Founded"],
        improvement: ["Improved", "Optimized", "Streamlined", "Restructured", "Modernized", "Transformed", "Strengthened"],
      },
      phrases: {
        intro: [
          "With a strong background in",
          "Passionate about",
          "With proven expertise in",
          "Driven by a constant desire to",
        ],
        skills: [
          "Deep proficiency in",
          "Proven expertise in",
          "Advanced skills in",
          "Solid background in",
        ],
        motivation: [
          "I am eager to leverage my skills",
          "I am confident I can bring significant value",
          "My goal is to actively contribute to",
          "I am determined to tackle the challenges of",
        ],
      },
    },
  },
};

export type Language = "fr" | "en";
export type TranslationKey = keyof typeof translations.fr;
