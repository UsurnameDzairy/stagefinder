import { Company } from "./companies";

export interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  type: string; // stage, alternance, graduate program, etc.
  description: string;
  url: string;
  postedDate?: Date;
  deadline?: Date;
  requirements?: string[];
  benefits?: string[];
}

export interface ScrapeResult {
  company: string;
  jobs: ScrapedJob[];
  scrapedAt: Date;
  success: boolean;
  error?: string;
}

// Fonction principale de scraping
export async function scrapeCompany(company: Company): Promise<ScrapeResult> {
  try {
    console.log(`Scraping ${company.name}...`);
    
    // Pour l'instant, on simule le scraping avec des données mock
    // Dans une vraie implémentation, on utiliserait Puppeteer, Cheerio, ou une API
    const jobs = await mockScrapeJobs(company);
    
    return {
      company: company.name,
      jobs,
      scrapedAt: new Date(),
      success: true,
    };
  } catch (error) {
    console.error(`Error scraping ${company.name}:`, error);
    return {
      company: company.name,
      jobs: [],
      scrapedAt: new Date(),
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Fonction pour scraper plusieurs entreprises en parallèle
export async function scrapeMultipleCompanies(
  companies: Company[],
  maxConcurrent = 3
): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];
  
  // Scraper par batch pour éviter de surcharger
  for (let i = 0; i < companies.length; i += maxConcurrent) {
    const batch = companies.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map((company) => scrapeCompany(company))
    );
    results.push(...batchResults);
    
    // Pause entre les batches
    if (i + maxConcurrent < companies.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}

// Fonction mock pour simuler le scraping (à remplacer par du vrai scraping)
async function mockScrapeJobs(company: Company): Promise<ScrapedJob[]> {
  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const jobs: ScrapedJob[] = [];
  const jobTypes = ["Stage", "Alternance", "Graduate Program", "Summer Internship"];
  const departments = [
    "Investment Banking",
    "Sales & Trading",
    "Technology",
    "Risk Management",
    "Quantitative Research",
    "Asset Management",
  ];
  
  // Générer 3-8 offres aléatoires par entreprise
  const numJobs = Math.floor(Math.random() * 6) + 3;
  
  for (let i = 0; i < numJobs; i++) {
    const jobType = company.programs[Math.floor(Math.random() * company.programs.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    const location = company.locations[Math.floor(Math.random() * company.locations.length)];
    
    jobs.push({
      title: `${jobType} - ${department}`,
      company: company.name,
      location,
      type: jobType.toLowerCase().includes("stage") || jobType.toLowerCase().includes("intern") 
        ? "stage" 
        : jobType.toLowerCase().includes("alternance") 
        ? "alternance" 
        : "graduate",
      description: `Rejoignez ${company.name} en tant que ${jobType} dans notre équipe ${department} à ${location}. Vous travaillerez sur des projets stratégiques et développerez vos compétences dans un environnement international.`,
      url: `${company.careerUrl}/${jobType.toLowerCase().replace(/\s+/g, "-")}-${department.toLowerCase().replace(/\s+/g, "-")}`,
      postedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
      requirements: [
        "Étudiant en dernière année d'école de commerce ou d'ingénieur",
        "Excellentes compétences analytiques",
        "Maîtrise de l'anglais (écrit et oral)",
        "Esprit d'équipe et capacité à travailler sous pression",
      ],
      benefits: [
        "Rémunération attractive",
        "Mentorat personnalisé",
        "Opportunités de carrière internationale",
        "Formation continue",
      ],
    });
  }
  
  return jobs;
}

// Fonction pour filtrer les offres selon des critères
export function filterJobs(
  jobs: ScrapedJob[],
  filters: {
    type?: string[];
    location?: string[];
    company?: string[];
    keywords?: string[];
  }
): ScrapedJob[] {
  return jobs.filter((job) => {
    if (filters.type && !filters.type.includes(job.type)) return false;
    if (filters.location && !filters.location.includes(job.location)) return false;
    if (filters.company && !filters.company.includes(job.company)) return false;
    if (filters.keywords) {
      const text = `${job.title} ${job.description}`.toLowerCase();
      const hasKeyword = filters.keywords.some((keyword) =>
        text.includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }
    return true;
  });
}
