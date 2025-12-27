// Fonction pour extraire les compétences d'un texte de CV
export function extractSkills(text: string): string[] {
  const commonSkills = [
    // Langages de programmation
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "PHP", "Ruby", "Go", "Rust",
    "Swift", "Kotlin", "Scala", "R", "MATLAB", "SQL", "HTML", "CSS",
    
    // Frameworks & Libraries
    "React", "Angular", "Vue", "Next.js", "Node.js", "Express", "Django", "Flask",
    "Spring", "Laravel", "Rails", "ASP.NET", "jQuery", "Bootstrap", "Tailwind",
    
    // Databases
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch", "Oracle", "SQL Server",
    
    // Cloud & DevOps
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins", "GitLab", "GitHub Actions",
    "Terraform", "Ansible",
    
    // Data & AI
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy",
    "Data Analysis", "Data Science", "Big Data", "Hadoop", "Spark",
    
    // Finance
    "Excel", "VBA", "Bloomberg", "Financial Modeling", "Valuation", "M&A", "DCF",
    "LBO", "Trading", "Risk Management", "Portfolio Management", "Derivatives",
    "Fixed Income", "Equity Research", "Investment Banking", "Private Equity",
    "Hedge Fund", "Asset Management", "Quantitative Analysis", "Financial Analysis",
    
    // Business
    "Project Management", "Agile", "Scrum", "Product Management", "Business Analysis",
    "Strategy", "Consulting", "Marketing", "Sales", "CRM", "SAP", "Salesforce",
    
    // Soft Skills
    "Leadership", "Communication", "Teamwork", "Problem Solving", "Critical Thinking",
    "Analytical Skills", "Presentation", "Negotiation",
    
    // Languages
    "English", "French", "Spanish", "German", "Chinese", "Japanese", "Arabic",
    "Anglais", "Français", "Espagnol", "Allemand", "Chinois", "Japonais", "Arabe",
  ];

  const foundSkills = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const skill of commonSkills) {
    const lowerSkill = skill.toLowerCase();
    // Chercher le skill avec des limites de mots pour éviter les faux positifs
    const regex = new RegExp(`\\b${lowerSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      foundSkills.add(skill);
    }
  }

  return Array.from(foundSkills);
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
  skills: string[];
  cities: string[];
  educationLevel: string | null;
  schoolName: string | null;
  domains: string[];
  rawText: string;
}

export function parseCV(text: string): ParsedCV {
  return {
    skills: extractSkills(text),
    cities: extractCities(text),
    educationLevel: extractEducationLevel(text),
    schoolName: extractSchoolName(text),
    domains: extractDomains(text),
    rawText: text,
  };
}
