// Liste exhaustive des compétences par catégorie
const SKILLS_DATABASE = {
  // Langages de programmation
  programming: [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "C", "PHP", "Ruby", "Go", "Rust",
    "Swift", "Kotlin", "Scala", "R", "MATLAB", "SQL", "HTML", "CSS", "Sass", "Less",
    "Perl", "Lua", "Haskell", "Clojure", "Elixir", "Erlang", "F#", "Objective-C",
    "Assembly", "Fortran", "COBOL", "Pascal", "Delphi", "Visual Basic", "VB.NET",
    "Groovy", "Dart", "Julia", "Shell", "Bash", "PowerShell", "Solidity",
  ],
  
  // Frameworks & Libraries
  frameworks: [
    "React", "React Native", "Angular", "Vue.js", "Vue", "Next.js", "Nuxt.js", "Svelte",
    "Node.js", "Express.js", "Express", "NestJS", "Fastify", "Koa",
    "Django", "Flask", "FastAPI", "Pyramid",
    "Spring", "Spring Boot", "Hibernate", "Maven", "Gradle",
    "Laravel", "Symfony", "CodeIgniter", "CakePHP",
    "Ruby on Rails", "Rails", "Sinatra",
    "ASP.NET", ".NET Core", ".NET", "Entity Framework",
    "jQuery", "Bootstrap", "Tailwind CSS", "Tailwind", "Material UI", "Chakra UI",
    "Redux", "MobX", "Zustand", "Recoil", "GraphQL", "Apollo", "Prisma",
    "Electron", "Tauri", "Flutter", "Ionic", "Xamarin",
  ],
  
  // Bases de données
  databases: [
    "MongoDB", "PostgreSQL", "MySQL", "MariaDB", "SQLite", "Redis", "Memcached",
    "Elasticsearch", "Oracle", "SQL Server", "Microsoft SQL Server", "DB2",
    "Cassandra", "DynamoDB", "Firebase", "Firestore", "Supabase", "CouchDB",
    "Neo4j", "InfluxDB", "TimescaleDB", "Snowflake", "BigQuery", "Redshift",
  ],
  
  // Cloud & DevOps
  cloud: [
    "AWS", "Amazon Web Services", "Azure", "Microsoft Azure", "GCP", "Google Cloud",
    "Docker", "Kubernetes", "K8s", "Jenkins", "GitLab CI", "GitHub Actions", "CircleCI",
    "Terraform", "Ansible", "Puppet", "Chef", "Vagrant",
    "Nginx", "Apache", "Caddy", "Traefik",
    "Heroku", "Vercel", "Netlify", "DigitalOcean", "Linode", "Cloudflare",
    "Linux", "Ubuntu", "CentOS", "Debian", "Red Hat", "RHEL",
    "CI/CD", "DevOps", "SRE", "Microservices", "Serverless", "Lambda",
  ],
  
  // Data & AI
  data: [
    "Machine Learning", "ML", "Deep Learning", "DL", "Artificial Intelligence", "AI",
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "XGBoost", "LightGBM",
    "Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn", "Plotly",
    "Data Analysis", "Data Science", "Data Engineering", "Data Mining",
    "Big Data", "Hadoop", "Spark", "Apache Spark", "Kafka", "Airflow",
    "NLP", "Natural Language Processing", "Computer Vision", "OpenCV",
    "Tableau", "Power BI", "Looker", "Metabase", "Superset",
    "ETL", "Data Warehouse", "Data Lake", "Data Pipeline",
    "Statistics", "Statistiques", "A/B Testing", "Regression", "Classification",
    "Neural Networks", "CNN", "RNN", "LSTM", "Transformer", "BERT", "GPT",
  ],
  
  // Finance
  finance: [
    "Excel", "VBA", "Macros Excel", "Power Query", "Power Pivot", "Microsoft Excel",
    "Word", "Microsoft Word", "PowerPoint", "Microsoft PowerPoint", "Office", "Microsoft Office",
    "Bloomberg", "Bloomberg Terminal", "Reuters", "Refinitiv", "FactSet", "Capital IQ", "S&P Capital IQ",
    "Financial Modeling", "Modélisation Financière", "Valuation", "Valorisation", "Modeling",
    "M&A", "Mergers & Acquisitions", "Fusions-Acquisitions", "Mergers and Acquisitions",
    "DCF", "Discounted Cash Flow", "LBO", "Leveraged Buyout", "Comps", "Comparable Analysis",
    "Trading", "Algorithmic Trading", "Quantitative Trading", "High Frequency Trading", "HFT",
    "Risk Management", "Gestion des Risques", "VaR", "Value at Risk", "Credit Risk", "Market Risk",
    "Portfolio Management", "Gestion de Portefeuille", "Asset Allocation", "Wealth Management",
    "Derivatives", "Produits Dérivés", "Options", "Futures", "Swaps", "Forwards", "Structured Products",
    "Fixed Income", "Obligations", "Bonds", "Credit Analysis", "Analyse Crédit", "Credit",
    "Equity Research", "Equity Analysis", "Stock Analysis", "Equity", "Actions",
    "Investment Banking", "Banque d'Investissement", "Corporate Finance", "IBD",
    "Private Equity", "Capital Investissement", "Venture Capital", "VC", "PE", "Growth Equity",
    "Hedge Fund", "Asset Management", "Gestion d'Actifs", "Fund Management",
    "Quantitative Analysis", "Quant", "Financial Analysis", "Analyse Financière", "Quantitative Finance",
    "Accounting", "Comptabilité", "IFRS", "US GAAP", "French GAAP", "Normes Comptables",
    "Audit", "Due Diligence", "Financial Reporting", "Reporting Financier", "Internal Audit",
    "Budgeting", "Forecasting", "Prévisions", "Business Plan", "Financial Planning",
    "KPI", "Financial KPIs", "ROI", "ROE", "EBITDA", "P&L", "Balance Sheet", "Cash Flow",
    "Finance", "Finance d'entreprise", "Corporate Finance", "Finance de marché", "Market Finance",
    "Analyse de données", "Data Analysis", "Financial Data", "Données financières",
    "Pitch Deck", "Investor Relations", "Relations Investisseurs", "Fundraising", "Levée de fonds",
  ],
  
  // Business & Management
  business: [
    "Project Management", "Gestion de Projet", "Program Management",
    "Agile", "Scrum", "Kanban", "Lean", "Six Sigma", "Prince2", "PMP",
    "Product Management", "Product Owner", "Scrum Master",
    "Business Analysis", "Analyse Business", "Requirements Analysis",
    "Strategy", "Stratégie", "Business Strategy", "Strategic Planning",
    "Consulting", "Conseil", "Management Consulting",
    "Marketing", "Digital Marketing", "Marketing Digital", "SEO", "SEM", "SEA",
    "Content Marketing", "Social Media Marketing", "Email Marketing",
    "Sales", "Ventes", "Business Development", "Account Management",
    "CRM", "Salesforce", "HubSpot", "Pipedrive", "Zoho",
    "SAP", "SAP S/4HANA", "SAP FICO", "SAP MM", "SAP SD",
    "ERP", "Oracle ERP", "Microsoft Dynamics",
    "Operations", "Supply Chain", "Logistics", "Procurement",
    "HR", "Human Resources", "Ressources Humaines", "Talent Acquisition",
    "Change Management", "Transformation", "Digital Transformation",
  ],
  
  // Soft Skills
  softSkills: [
    "Leadership", "Team Leadership", "People Management",
    "Communication", "Written Communication", "Oral Communication", "Présentation",
    "Teamwork", "Travail d'équipe", "Collaboration", "Cross-functional",
    "Problem Solving", "Résolution de Problèmes", "Analytical Thinking",
    "Critical Thinking", "Esprit Critique", "Decision Making",
    "Creativity", "Créativité", "Innovation",
    "Adaptability", "Adaptabilité", "Flexibility", "Polyvalence",
    "Time Management", "Gestion du Temps", "Organization", "Organisation",
    "Negotiation", "Négociation", "Persuasion", "Influence",
    "Presentation Skills", "Public Speaking", "Prise de Parole",
    "Autonomy", "Autonomie", "Initiative", "Proactivity", "Proactivité",
    "Attention to Detail", "Rigueur", "Précision",
    "Stress Management", "Gestion du Stress", "Pressure", "Deadlines",
  ],
  
  // Langues
  languages: [
    "English", "Anglais", "French", "Français", "Spanish", "Espagnol",
    "German", "Allemand", "Italian", "Italien", "Portuguese", "Portugais",
    "Chinese", "Chinois", "Mandarin", "Japanese", "Japonais",
    "Korean", "Coréen", "Arabic", "Arabe", "Russian", "Russe",
    "Dutch", "Néerlandais", "Swedish", "Suédois", "Norwegian", "Norvégien",
    "Danish", "Danois", "Finnish", "Finnois", "Polish", "Polonais",
    "Turkish", "Turc", "Hindi", "Hebrew", "Hébreu", "Greek", "Grec",
  ],
  
  // Outils & Logiciels
  tools: [
    "Git", "GitHub", "GitLab", "Bitbucket", "SVN",
    "Jira", "Confluence", "Trello", "Asana", "Monday.com", "Notion",
    "Slack", "Microsoft Teams", "Zoom", "Google Meet",
    "Figma", "Sketch", "Adobe XD", "InVision", "Zeplin",
    "Photoshop", "Illustrator", "InDesign", "After Effects", "Premiere Pro",
    "Microsoft Office", "Word", "PowerPoint", "Outlook",
    "Google Workspace", "Google Sheets", "Google Docs", "Google Slides",
    "Postman", "Insomnia", "Swagger", "OpenAPI",
    "VS Code", "Visual Studio", "IntelliJ", "PyCharm", "WebStorm", "Eclipse",
    "Jupyter", "Jupyter Notebook", "Google Colab", "Anaconda",
  ],
  
  // Certifications
  certifications: [
    "AWS Certified", "AWS Solutions Architect", "AWS Developer",
    "Azure Certified", "Google Cloud Certified", "GCP Professional",
    "PMP", "PRINCE2", "Scrum Master", "PSM", "CSM", "SAFe",
    "CFA", "CFA Level 1", "CFA Level 2", "CFA Level 3",
    "FRM", "CAIA", "CPA", "ACCA",
    "CISSP", "CISM", "CEH", "CompTIA Security+",
    "Cisco CCNA", "CCNP", "CCIE",
    "Six Sigma Green Belt", "Six Sigma Black Belt",
    "ITIL", "TOGAF", "Lean Six Sigma",
    "Google Analytics", "Google Ads", "Facebook Blueprint",
    "Salesforce Certified", "HubSpot Certified",
    "TOEFL", "TOEIC", "IELTS", "Cambridge", "DELF", "DALF",
  ],
};

// Fonction pour extraire les compétences d'un texte de CV
export function extractSkills(text: string): string[] {
  const foundSkills = new Set<string>();

  // UNIQUEMENT matcher avec la base de données de compétences connues
  const allSkills = Object.values(SKILLS_DATABASE).flat();

  for (const skill of allSkills) {
    // Ignorer les compétences trop courtes (C, R, etc.) sauf si elles sont dans un contexte clair
    if (skill.length <= 2) {
      // Pour les compétences courtes, chercher un contexte plus précis
      const contextPatterns = [
        new RegExp(`\\b${skill}\\s+(programming|language|langage)`, 'i'),
        new RegExp(`(programming|language|langage)\\s+${skill}\\b`, 'i'),
        new RegExp(`\\b${skill}[,;]\\s*[A-Z]`, 'i'), // C, Python ou R, SQL
        new RegExp(`[A-Za-z],\\s*${skill}\\b`, 'i'), // Python, C ou SQL, R
      ];

      if (contextPatterns.some(pattern => pattern.test(text))) {
        foundSkills.add(skill);
      }
    } else {
      // Pour les compétences de 3+ caractères, utiliser la méthode standard
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      if (regex.test(text)) {
        foundSkills.add(skill);
      }
    }
  }

  return Array.from(foundSkills);
}


// Fonction pour extraire les compétences par catégorie
export function extractSkillsByCategory(text: string): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  
  for (const [category, skills] of Object.entries(SKILLS_DATABASE)) {
    const foundSkills: string[] = [];
    for (const skill of skills) {
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      if (regex.test(text)) {
        foundSkills.push(skill);
      }
    }
    if (foundSkills.length > 0) {
      result[category] = foundSkills;
    }
  }
  
  return result;
}

// Fonction pour extraire le nom et prénom
export function extractName(text: string): { firstName: string | null; lastName: string | null; fullName: string | null } {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Le nom est souvent dans les premières lignes du CV
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    
    // Ignorer les lignes avec des mots-clés communs
    const ignoreKeywords = ['cv', 'curriculum', 'vitae', 'resume', 'profil', 'profile', 'contact', 'email', 'téléphone', 'phone', 'adresse', 'address'];
    if (ignoreKeywords.some(kw => line.toLowerCase().includes(kw))) continue;
    
    // Ignorer les lignes avec des emails ou numéros de téléphone
    if (line.includes('@') || /\d{2}[\s.-]?\d{2}[\s.-]?\d{2}/.test(line)) continue;
    
    // Chercher un pattern de nom (2-4 mots commençant par une majuscule)
    const namePattern = /^([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][a-zàâäéèêëïîôùûüç]+(?:\s+[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][a-zàâäéèêëïîôùûüç]+){1,3})$/;
    const match = line.match(namePattern);
    
    if (match) {
      const parts = match[1].split(/\s+/);
      return {
        firstName: parts[0] || null,
        lastName: parts.slice(1).join(' ') || null,
        fullName: match[1],
      };
    }
    
    // Pattern alternatif : NOM PRÉNOM en majuscules
    const upperNamePattern = /^([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ]{2,}(?:\s+[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ]{2,}){1,3})$/;
    const upperMatch = line.match(upperNamePattern);
    
    if (upperMatch) {
      const parts = upperMatch[1].split(/\s+/);
      // Convertir en Title Case
      const toTitleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      return {
        firstName: toTitleCase(parts[0]) || null,
        lastName: parts.slice(1).map(toTitleCase).join(' ') || null,
        fullName: parts.map(toTitleCase).join(' '),
      };
    }
  }
  
  return { firstName: null, lastName: null, fullName: null };
}

// Fonction pour extraire l'email
export function extractEmail(text: string): string | null {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailPattern);
  return match ? match[0].toLowerCase() : null;
}

// Fonction pour extraire le numéro de téléphone
export function extractPhone(text: string): string | null {
  // Patterns français et internationaux
  const phonePatterns = [
    /(?:\+33|0033|0)\s*[1-9](?:[\s.-]*\d{2}){4}/, // France
    /\+\d{1,3}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/, // International
    /\d{2}[\s.-]\d{2}[\s.-]\d{2}[\s.-]\d{2}[\s.-]\d{2}/, // 01 23 45 67 89
  ];
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/[\s.-]/g, ' ').trim();
    }
  }
  
  return null;
}

// Fonction pour extraire les expériences professionnelles
export function extractExperiences(text: string): Array<{
  company: string;
  position: string | null;
  period: string | null;
  location: string | null;
}> {
  const experiences: Array<{
    company: string;
    position: string | null;
    period: string | null;
    location: string | null;
  }> = [];
  
  // Liste d'entreprises connues
  const knownCompanies = [
    // Banques & Finance
    "BNP Paribas", "Société Générale", "Crédit Agricole", "BPCE", "Natixis",
    "HSBC", "Barclays", "Deutsche Bank", "UBS", "Credit Suisse", "Goldman Sachs",
    "Morgan Stanley", "JP Morgan", "JPMorgan", "Citi", "Citibank", "Bank of America",
    "Lazard", "Rothschild", "Evercore", "Moelis", "Centerview", "PJT Partners",
    "Blackstone", "KKR", "Carlyle", "Apollo", "TPG", "Bain Capital", "Advent",
    "BlackRock", "Vanguard", "Fidelity", "Amundi", "AXA", "Allianz",
    
    // Conseil
    "McKinsey", "BCG", "Boston Consulting Group", "Bain & Company", "Bain",
    "Deloitte", "PwC", "EY", "Ernst & Young", "KPMG",
    "Accenture", "Capgemini", "Atos", "Sopra Steria", "CGI",
    "Oliver Wyman", "Roland Berger", "Kearney", "AT Kearney", "Strategy&",
    
    // Tech
    "Google", "Amazon", "Meta", "Facebook", "Apple", "Microsoft", "Netflix",
    "Uber", "Airbnb", "Spotify", "Twitter", "LinkedIn", "Salesforce", "Adobe",
    "SAP", "Oracle", "IBM", "Intel", "Nvidia", "AMD", "Qualcomm",
    "Stripe", "Square", "PayPal", "Revolut", "N26", "Klarna",
    "Datadog", "Snowflake", "Palantir", "Databricks", "MongoDB",
    
    // Tech FR
    "Criteo", "Dassault Systèmes", "OVH", "OVHcloud", "Doctolib", "BlaBlaCar",
    "Mirakl", "Contentsquare", "Dataiku", "Alan", "Qonto", "Payfit", "Swile",
    "Back Market", "Vestiaire Collective", "ManoMano", "Veepee", "Vente-privee",
    
    // Industrie
    "Total", "TotalEnergies", "Engie", "EDF", "Veolia", "Suez",
    "Airbus", "Safran", "Thales", "Dassault Aviation", "Naval Group",
    "Renault", "Stellantis", "PSA", "Peugeot", "Citroën", "Michelin", "Valeo",
    "L'Oréal", "LVMH", "Kering", "Hermès", "Chanel", "Dior",
    "Danone", "Nestlé", "Unilever", "Procter & Gamble", "P&G",
    "Sanofi", "Servier", "Ipsen", "BioMérieux", "Essilor", "Luxottica",
    "Saint-Gobain", "Schneider Electric", "Legrand", "Vinci", "Bouygues", "Eiffage",
    "Orange", "SFR", "Bouygues Telecom", "Free", "Iliad",
    "Carrefour", "Auchan", "Leclerc", "Casino", "Intermarché",
    "Air France", "SNCF", "Transdev", "Keolis",
  ];
  
  // Chercher les entreprises connues
  for (const company of knownCompanies) {
    const escapedCompany = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedCompany}\\b`, 'i');
    if (regex.test(text)) {
      // Essayer de trouver le contexte autour de l'entreprise
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (regex.test(lines[i])) {
          // Chercher une période (dates)
          const periodPattern = /(\d{4})\s*[-–]\s*(\d{4}|présent|present|aujourd'hui|actuel)/i;
          const periodMatch = lines[i].match(periodPattern) || (i > 0 ? lines[i-1].match(periodPattern) : null);
          
          experiences.push({
            company,
            position: null,
            period: periodMatch ? periodMatch[0] : null,
            location: null,
          });
          break;
        }
      }
    }
  }
  
  return experiences;
}

// Fonction pour extraire les langues avec niveau
export function extractLanguages(text: string): Array<{ language: string; level: string | null }> {
  const languages: Array<{ language: string; level: string | null }> = [];
  
  const languageMap: Record<string, string> = {
    'anglais': 'Anglais', 'english': 'Anglais',
    'français': 'Français', 'french': 'Français',
    'espagnol': 'Espagnol', 'spanish': 'Espagnol',
    'allemand': 'Allemand', 'german': 'Allemand',
    'italien': 'Italien', 'italian': 'Italien',
    'portugais': 'Portugais', 'portuguese': 'Portugais',
    'chinois': 'Chinois', 'chinese': 'Chinois', 'mandarin': 'Chinois',
    'japonais': 'Japonais', 'japanese': 'Japonais',
    'arabe': 'Arabe', 'arabic': 'Arabe',
    'russe': 'Russe', 'russian': 'Russe',
  };
  
  const levels = ['natif', 'native', 'bilingue', 'bilingual', 'courant', 'fluent', 'avancé', 'advanced', 'intermédiaire', 'intermediate', 'débutant', 'beginner', 'notions', 'basic', 'c2', 'c1', 'b2', 'b1', 'a2', 'a1'];
  
  const lowerText = text.toLowerCase();
  
  for (const [key, lang] of Object.entries(languageMap)) {
    if (lowerText.includes(key)) {
      // Chercher le niveau à proximité
      let foundLevel: string | null = null;
      const langIndex = lowerText.indexOf(key);
      const context = lowerText.substring(Math.max(0, langIndex - 30), Math.min(lowerText.length, langIndex + key.length + 30));
      
      for (const level of levels) {
        if (context.includes(level)) {
          foundLevel = level.charAt(0).toUpperCase() + level.slice(1);
          break;
        }
      }
      
      // Éviter les doublons
      if (!languages.some(l => l.language === lang)) {
        languages.push({ language: lang, level: foundLevel });
      }
    }
  }
  
  return languages;
}

// Fonction pour extraire les villes d'un texte de CV
export function extractCities(text: string): string[] {
  const frenchCities = [
    "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg",
    "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre", "Saint-Étienne",
    "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes", "Villeurbanne", "Clermont-Ferrand",
    "Le Mans", "Aix-en-Provence", "Brest", "Tours", "Amiens", "Limoges", "Annecy",
    "Perpignan", "Metz", "Besançon", "Orléans", "Rouen", "Mulhouse", "Caen",
  ];

  const internationalCities = [
    "London", "New York", "Hong Kong", "Singapore", "Tokyo", "Dubai", "Frankfurt",
    "Zurich", "Geneva", "Luxembourg", "Brussels", "Amsterdam", "Milan", "Madrid",
    "Barcelona", "Berlin", "Munich", "Stockholm", "Copenhagen", "Oslo", "Helsinki",
    "Vienna", "Prague", "Warsaw", "Budapest", "Lisbon", "Dublin", "Edinburgh",
    "Montreal", "Toronto", "Vancouver", "Sydney", "Melbourne", "Shanghai", "Beijing",
    "Seoul", "Mumbai", "Delhi", "Bangalore", "São Paulo", "Mexico City", "Buenos Aires",
  ];

  const allCities = [...frenchCities, ...internationalCities];
  const foundCities = new Set<string>();

  for (const city of allCities) {
    const regex = new RegExp(`\\b${city}\\b`, 'i');
    if (regex.test(text)) {
      foundCities.add(city);
    }
  }

  return Array.from(foundCities);
}

// Fonction pour extraire le niveau d'études
export function extractEducationLevel(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  const educationLevels = [
    { keywords: ["master 2", "m2", "master's degree", "diplôme d'ingénieur"], level: "Master 2 / Bac+5" },
    { keywords: ["master 1", "m1"], level: "Master 1 / Bac+4" },
    { keywords: ["licence", "bachelor", "bac+3"], level: "Licence / Bac+3" },
    { keywords: ["bts", "dut", "bac+2"], level: "BTS/DUT / Bac+2" },
    { keywords: ["doctorat", "phd", "doctorate"], level: "Doctorat / Bac+8" },
    { keywords: ["mba"], level: "MBA" },
  ];

  for (const { keywords, level } of educationLevels) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return level;
      }
    }
  }

  return null;
}

// Fonction pour extraire le nom de l'école
export function extractSchoolName(text: string): string | null {
  const schools = [
    // Grandes écoles de commerce
    "HEC", "ESSEC", "ESCP", "EDHEC", "EM Lyon", "SKEMA", "Grenoble EM", "Audencia",
    "Neoma", "Toulouse BS", "Kedge", "Rennes SB", "Montpellier BS",
    
    // Écoles d'ingénieurs
    "Polytechnique", "Centrale", "Mines", "Ponts", "Télécom", "Supélec", "ENSTA",
    "ENSAE", "ENSAI", "Arts et Métiers", "INSA", "UTC", "ESIEE", "Epitech", "42",
    
    // Universités
    "Sorbonne", "Paris-Dauphine", "Sciences Po", "ENS", "Université Paris",
    "Université Lyon", "Université Toulouse", "Université Bordeaux",
  ];

  for (const school of schools) {
    const regex = new RegExp(`\\b${school}\\b`, 'i');
    if (regex.test(text)) {
      return school;
    }
  }

  return null;
}

// Fonction pour extraire les domaines d'intérêt
export function extractDomains(text: string): string[] {
  const domains = [
    "Finance", "Technology", "Tech", "Consulting", "Conseil", "Banking", "Banque",
    "Investment Banking", "Private Equity", "Hedge Fund", "Asset Management",
    "Trading", "Sales & Trading", "Risk Management", "Quantitative Finance",
    "Data Science", "Machine Learning", "Artificial Intelligence", "AI",
    "Software Engineering", "Web Development", "Mobile Development",
    "Product Management", "Project Management", "Business Development",
    "Marketing", "Digital Marketing", "Strategy", "Operations",
  ];

  const foundDomains = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const domain of domains) {
    const regex = new RegExp(`\\b${domain.toLowerCase()}\\b`, 'i');
    if (regex.test(text)) {
      foundDomains.add(domain);
    }
  }

  return Array.from(foundDomains);
}

// Fonction principale pour parser un CV
export interface ParsedCV {
  // Informations personnelles
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  
  // Compétences
  skills: string[];
  skillsByCategory: Record<string, string[]>;
  
  // Localisation
  cities: string[];
  
  // Formation
  educationLevel: string | null;
  schoolName: string | null;
  
  // Expériences
  experiences: Array<{
    company: string;
    position: string | null;
    period: string | null;
    location: string | null;
  }>;
  
  // Langues
  languages: Array<{ language: string; level: string | null }>;
  
  // Domaines
  domains: string[];
  
  // Texte brut
  rawText: string;
}

export function parseCV(text: string): ParsedCV {
  const nameInfo = extractName(text);
  
  return {
    // Informations personnelles
    firstName: nameInfo.firstName,
    lastName: nameInfo.lastName,
    fullName: nameInfo.fullName,
    email: extractEmail(text),
    phone: extractPhone(text),
    
    // Compétences
    skills: extractSkills(text),
    skillsByCategory: extractSkillsByCategory(text),
    
    // Localisation
    cities: extractCities(text),
    
    // Formation
    educationLevel: extractEducationLevel(text),
    schoolName: extractSchoolName(text),
    
    // Expériences
    experiences: extractExperiences(text),
    
    // Langues
    languages: extractLanguages(text),
    
    // Domaines
    domains: extractDomains(text),
    
    // Texte brut
    rawText: text,
  };
}
