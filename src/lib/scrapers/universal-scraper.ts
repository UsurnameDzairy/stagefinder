/**
 * Universal Job Scraper
 * Scrape des offres d'emploi depuis n'importe quel site dans le monde
 * Utilise plusieurs sources: Google Jobs, Indeed, LinkedIn, sites d'entreprises
 */

export interface UniversalJobOffer {
  title: string;
  company: string;
  location: string;
  country: string;
  contractType: string; // stage, alternance, cdi, cdd, freelance
  description: string;
  url: string;
  source: string; // indeed, linkedin, google, company_website
  postedDate: Date;
  salary?: string;
  remote?: boolean;
  skills?: string[];
}

export interface ScrapeOptions {
  query: string;
  location?: string;
  country?: string;
  contractType?: string[];
  sources?: string[]; // indeed, linkedin, google, glassdoor
  maxResults?: number;
  language?: string;
}

/**
 * Scraper Google Jobs (via SerpAPI ou ScraperAPI)
 */
async function scrapeGoogleJobs(options: ScrapeOptions): Promise<UniversalJobOffer[]> {
  const { query, location = "", country = "fr", maxResults = 20 } = options;
  
  // Construction de la requête Google Jobs
  const searchQuery = `${query} ${location} ${country}`;
  const googleJobsUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&ibp=htl;jobs`;
  
  console.log(`Scraping Google Jobs: ${searchQuery}`);
  
  // TODO: Implémenter avec SerpAPI ou Puppeteer
  // Pour l'instant, retourne un tableau vide
  return [];
}

/**
 * Scraper Indeed
 */
async function scrapeIndeed(options: ScrapeOptions): Promise<UniversalJobOffer[]> {
  const { query, location = "", country = "fr", maxResults = 20 } = options;
  
  const countryDomains: Record<string, string> = {
    fr: "fr",
    us: "com",
    uk: "co.uk",
    de: "de",
    es: "es",
    it: "it",
    ca: "ca",
  };
  
  const domain = countryDomains[country] || "com";
  const indeedUrl = `https://${country}.indeed.${domain}/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`;
  
  console.log(`Scraping Indeed: ${indeedUrl}`);
  
  // TODO: Implémenter avec Puppeteer ou Cheerio
  return [];
}

/**
 * Scraper LinkedIn Jobs
 */
async function scrapeLinkedIn(options: ScrapeOptions): Promise<UniversalJobOffer[]> {
  const { query, location = "", maxResults = 20 } = options;
  
  const linkedInUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;
  
  console.log(`Scraping LinkedIn: ${linkedInUrl}`);
  
  // TODO: Implémenter avec Puppeteer (nécessite authentification)
  return [];
}

/**
 * Scraper Welcome to the Jungle
 */
async function scrapeWelcomeToTheJungle(options: ScrapeOptions): Promise<UniversalJobOffer[]> {
  const { query, location = "", maxResults = 20 } = options;
  
  const wttjUrl = `https://www.welcometothejungle.com/fr/jobs?query=${encodeURIComponent(query)}&refinementList[offices.city][]=${encodeURIComponent(location)}`;
  
  console.log(`Scraping WTTJ: ${wttjUrl}`);
  
  // TODO: Implémenter avec leur API ou Puppeteer
  return [];
}

/**
 * Scraper HelloWork
 */
async function scrapeHelloWork(options: ScrapeOptions): Promise<UniversalJobOffer[]> {
  const { query, location = "", maxResults = 20 } = options;
  
  const helloWorkUrl = `https://www.hellowork.com/fr-fr/emplois.html?k=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`;
  
  console.log(`Scraping HelloWork: ${helloWorkUrl}`);
  
  // TODO: Implémenter
  return [];
}

/**
 * Scraper universel - agrège toutes les sources
 */
export async function scrapeUniversalJobs(options: ScrapeOptions): Promise<UniversalJobOffer[]> {
  const sources = options.sources || ["google", "indeed", "linkedin", "wttj", "hellowork"];
  const allJobs: UniversalJobOffer[] = [];
  
  const scrapers: Record<string, (opts: ScrapeOptions) => Promise<UniversalJobOffer[]>> = {
    google: scrapeGoogleJobs,
    indeed: scrapeIndeed,
    linkedin: scrapeLinkedIn,
    wttj: scrapeWelcomeToTheJungle,
    hellowork: scrapeHelloWork,
  };
  
  // Scraper en parallèle
  const promises = sources
    .filter(source => scrapers[source])
    .map(source => scrapers[source](options).catch(err => {
      console.error(`Error scraping ${source}:`, err);
      return [];
    }));
  
  const results = await Promise.all(promises);
  
  // Fusionner et dédupliquer
  results.forEach(jobs => allJobs.push(...jobs));
  
  // Dédupliquer par URL et titre
  const uniqueJobs = Array.from(
    new Map(allJobs.map(job => [`${job.company}-${job.title}-${job.location}`, job])).values()
  );
  
  // Limiter les résultats
  return uniqueJobs.slice(0, options.maxResults || 50);
}

/**
 * Scraper avec Puppeteer (pour sites dynamiques)
 */
export async function scrapeDynamicSite(url: string, selectors: {
  jobCard: string;
  title: string;
  company: string;
  location: string;
  link: string;
}): Promise<UniversalJobOffer[]> {
  // TODO: Implémenter avec Puppeteer
  console.log(`Scraping dynamic site: ${url}`);
  return [];
}

/**
 * Scraper avec Cheerio (pour sites statiques)
 */
export async function scrapeStaticSite(url: string, selectors: {
  jobCard: string;
  title: string;
  company: string;
  location: string;
  link: string;
}): Promise<UniversalJobOffer[]> {
  // TODO: Implémenter avec Cheerio
  console.log(`Scraping static site: ${url}`);
  return [];
}

/**
 * Utiliser une API tierce (RapidAPI, SerpAPI, ScraperAPI)
 */
export async function scrapeWithAPI(options: ScrapeOptions): Promise<UniversalJobOffer[]> {
  // Exemple avec SerpAPI (nécessite clé API)
  const SERPAPI_KEY = process.env.SERPAPI_KEY;
  
  if (!SERPAPI_KEY) {
    console.warn("⚠️ SerpAPI key not configured");
    return [];
  }
  
  const { query, location = "", country = "fr" } = options;
  
  try {
    // Optimiser la localisation pour Google Jobs
    let searchLocation = location || "France";
    if (searchLocation.toLowerCase() === "paris") {
      searchLocation = "Paris, France";
    } else if (searchLocation && !searchLocation.includes(",")) {
      searchLocation = `${searchLocation}, France`;
    }
    
    // Traduire et enrichir les termes pour améliorer les résultats Google Jobs
    const translations: Record<string, string> = {
      "développeur": "software engineer developer",
      "ingénieur": "engineer",
      "analyste": "analyst",
      "consultant": "consultant",
      "chef de projet": "project manager",
      "commercial": "sales",
      "marketing": "marketing manager",
      "finance": "finance analyst",
      "comptable": "accountant",
      "rh": "human resources",
      "ressources humaines": "human resources",
      "tech": "software engineer developer",
      "it": "software engineer developer",
      "data": "data analyst engineer",
      "stage": "internship",
      "alternance": "apprenticeship",
    };
    
    let searchQuery = query.toLowerCase().trim();
    let translatedQuery = query;
    
    // Essayer de traduire/enrichir si c'est un terme français ou trop vague
    for (const [fr, en] of Object.entries(translations)) {
      if (searchQuery === fr || searchQuery.includes(fr)) {
        translatedQuery = searchQuery.replace(fr, en);
        console.log(`🔄 Optimizing query: "${query}" → "${translatedQuery}"`);
        break;
      }
    }
    
    // Si la requête est très courte (< 4 caractères), l'enrichir
    if (translatedQuery.length < 4 && !translations[searchQuery]) {
      translatedQuery = `${translatedQuery} jobs`;
      console.log(`🔄 Enriching short query: "${query}" → "${translatedQuery}"`);
    }
    
    const url = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(translatedQuery)}&location=${encodeURIComponent(searchLocation)}&hl=${country}&api_key=${SERPAPI_KEY}`;
    
    console.log(`🔍 Calling SerpAPI: "${translatedQuery}" in ${searchLocation}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`📊 SerpAPI response status:`, response.status);
    
    if (data.error) {
      console.error("❌ SerpAPI error:", data.error);
      // Si erreur, essayer avec la requête originale
      return [];
    }
    
    if (!data.jobs_results || data.jobs_results.length === 0) {
      console.warn("⚠️ No jobs found in SerpAPI response");
      return [];
    }
    
    console.log(`✅ Found ${data.jobs_results.length} REAL jobs from SerpAPI`);
    
    return data.jobs_results.map((job: any) => {
      // Priorité: apply_options > related_links > share_url
      let jobUrl = "";
      
      // 1. Essayer apply_options (liens directs vers l'offre)
      if (job.apply_options && job.apply_options.length > 0) {
        jobUrl = job.apply_options[0].link || "";
      }
      
      // 2. Sinon, essayer related_links
      if (!jobUrl && job.related_links && job.related_links.length > 0) {
        jobUrl = job.related_links[0].link || "";
      }
      
      // 3. Fallback sur share_url
      if (!jobUrl) {
        jobUrl = job.share_url || "";
      }
      
      // Parser la date de publication
      let postedDate = new Date();
      if (job.detected_extensions?.posted_at) {
        const parsedDate = new Date(job.detected_extensions.posted_at);
        if (!isNaN(parsedDate.getTime())) {
          postedDate = parsedDate;
        }
      }
      
      return {
        title: job.title,
        company: job.company_name,
        location: job.location,
        country: country,
        contractType: detectContractType(job.title, job.description),
        description: job.description || "",
        url: jobUrl,
        source: "google",
        postedDate: postedDate,
        salary: job.detected_extensions?.salary,
        remote: job.description?.toLowerCase().includes("remote") || 
                job.description?.toLowerCase().includes("télétravail"),
        skills: extractSkills(job.description || ""),
      };
    });
  } catch (error) {
    console.error("❌ SerpAPI fetch error:", error);
    return [];
  }
}

/**
 * Détecter le type de contrat depuis le titre/description
 */
function detectContractType(title: string, description: string = ""): string {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes("stage") || text.includes("intern")) return "stage";
  if (text.includes("alternance") || text.includes("apprentice")) return "alternance";
  if (text.includes("cdi") || text.includes("permanent")) return "cdi";
  if (text.includes("cdd") || text.includes("temporary")) return "cdd";
  if (text.includes("freelance") || text.includes("contractor")) return "freelance";
  
  return "cdi";
}

/**
 * Extraire les compétences depuis la description
 */
function extractSkills(description: string): string[] {
  const commonSkills = [
    "JavaScript", "TypeScript", "Python", "Java", "C++", "React", "Node.js",
    "Angular", "Vue", "SQL", "MongoDB", "AWS", "Azure", "Docker", "Kubernetes",
    "Git", "Agile", "Scrum", "Excel", "PowerPoint", "Tableau", "Power BI",
    "Machine Learning", "Data Analysis", "Finance", "Accounting", "Marketing",
  ];
  
  const foundSkills: string[] = [];
  const lowerDesc = description.toLowerCase();
  
  commonSkills.forEach(skill => {
    if (lowerDesc.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  return foundSkills;
}
