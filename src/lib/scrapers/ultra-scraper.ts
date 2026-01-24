/**
 * ULTRA SCRAPER - Scraper ultra performant avec 100% de fiabilité
 * 
 * Stratégies multiples pour garantir des résultats:
 * 1. APIs officielles (Adzuna, JSearch, RemoteOK)
 * 2. SerpAPI Google Jobs
 * 3. Scraping direct avec retry et fallback
 * 4. Cache intelligent
 */

import axios from 'axios';

interface JobOffer {
  title: string;
  company: string;
  location: string;
  contractType: string;
  description: string;
  url: string;
  source: string;
  postedDate: Date;
  skills: string[];
  salary?: string;
}

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Cache en mémoire pour éviter les requêtes répétées
const cache = new Map<string, { data: JobOffer[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fonction utilitaire pour retry avec backoff exponentiel
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`   ⏳ Retry ${i + 1}/${maxRetries} après ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Normaliser la localisation pour de meilleurs résultats
 */
function normalizeLocation(location: string): string {
  const locationMap: Record<string, string> = {
    'monaco': 'Monaco, France',
    'paris': 'Paris, France',
    'lyon': 'Lyon, France',
    'marseille': 'Marseille, France',
    'france': 'France',
    'london': 'London, UK',
    'new york': 'New York, USA',
  };
  
  const normalized = locationMap[location.toLowerCase()] || location;
  return normalized;
}

/**
 * SOURCE 1: Google Jobs via SerpAPI (très fiable)
 */
async function scrapeGoogleJobsAPI(query: string, location: string): Promise<JobOffer[]> {
  if (!SERPAPI_KEY) {
    console.log('   ⚠️ SerpAPI key not configured');
    return [];
  }
  
  const jobs: JobOffer[] = [];
  
  try {
    console.log(`   🔍 [Google Jobs] "${query}" in ${location}`);
    
    const response = await retryWithBackoff(async () => {
      return axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google_jobs',
          q: query,
          location: normalizeLocation(location),
          hl: 'fr',
          gl: 'fr',
          api_key: SERPAPI_KEY,
        },
        timeout: 30000,
      });
    });
    
    if (response.data.jobs_results) {
      for (const job of response.data.jobs_results) {
        jobs.push({
          title: job.title || '',
          company: job.company_name || 'Entreprise',
          location: job.location || location,
          contractType: detectContractType(job.title + ' ' + (job.description || '')),
          description: (job.description || '').substring(0, 500),
          url: job.apply_options?.[0]?.link || job.share_link || `https://www.google.com/search?q=${encodeURIComponent(job.title + ' ' + job.company_name)}`,
          source: 'google_jobs',
          postedDate: parseDate(job.detected_extensions?.posted_at),
          skills: extractSkills(job.title + ' ' + (job.description || '')),
          salary: job.detected_extensions?.salary,
        });
      }
    }
    
    console.log(`   ✅ [Google Jobs] ${jobs.length} offres trouvées`);
  } catch (error: any) {
    console.error(`   ❌ [Google Jobs] Erreur:`, error.message);
  }
  
  return jobs;
}

/**
 * SOURCE 2: Adzuna API (gratuit, très fiable)
 */
async function scrapeAdzunaAPI(query: string, location: string): Promise<JobOffer[]> {
  const jobs: JobOffer[] = [];
  
  // Adzuna API gratuite (pas besoin de clé pour les requêtes basiques)
  const countryCode = location.toLowerCase().includes('france') || 
                      location.toLowerCase().includes('paris') ||
                      location.toLowerCase().includes('monaco') ? 'fr' : 'gb';
  
  try {
    console.log(`   🔍 [Adzuna] "${query}" in ${location}`);
    
    // Utiliser la recherche Google pour Adzuna comme fallback
    const searchUrl = `https://www.adzuna.fr/search?q=${encodeURIComponent(query)}&loc=${encodeURIComponent(location)}`;
    
    // Adzuna nécessite une clé API - retourner vide si pas configuré
    console.log(`   ⚠️ [Adzuna] API key required for real results`);
    
    console.log(`   ✅ [Adzuna] ${jobs.length} offres trouvées`);
  } catch (error: any) {
    console.error(`   ❌ [Adzuna] Erreur:`, error.message);
  }
  
  return jobs;
}

/**
 * SOURCE 3: RemoteOK API (gratuit, pour jobs remote)
 */
async function scrapeRemoteOK(query: string): Promise<JobOffer[]> {
  const jobs: JobOffer[] = [];
  
  try {
    console.log(`   🔍 [RemoteOK] "${query}"`);
    
    const response = await retryWithBackoff(async () => {
      return axios.get('https://remoteok.com/api', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        timeout: 15000,
      });
    });
    
    if (Array.isArray(response.data)) {
      const queryLower = query.toLowerCase();
      const filtered = response.data
        .filter((job: any) => job.position && job.company)
        .filter((job: any) => {
          const text = `${job.position} ${job.company} ${job.description || ''} ${(job.tags || []).join(' ')}`.toLowerCase();
          return text.includes(queryLower) || 
                 queryLower.split(' ').some(word => text.includes(word));
        })
        .slice(0, 10);
      
      for (const job of filtered) {
        jobs.push({
          title: job.position,
          company: job.company,
          location: job.location || 'Remote',
          contractType: 'cdi',
          description: (job.description || '').substring(0, 500),
          url: job.url || `https://remoteok.com/remote-jobs/${job.slug || job.id}`,
          source: 'remoteok',
          postedDate: new Date(job.date || Date.now()),
          skills: job.tags || [],
          salary: job.salary,
        });
      }
    }
    
    console.log(`   ✅ [RemoteOK] ${jobs.length} offres trouvées`);
  } catch (error: any) {
    console.error(`   ❌ [RemoteOK] Erreur:`, error.message);
  }
  
  return jobs;
}

/**
 * SOURCE 4: JSearch API (RapidAPI) - API gratuite avec vraies offres
 */
async function scrapeJSearchAPI(query: string, location: string): Promise<JobOffer[]> {
  if (!RAPIDAPI_KEY) {
    console.log('   ⚠️ RapidAPI key not configured for JSearch');
    return [];
  }
  
  const jobs: JobOffer[] = [];
  
  try {
    console.log(`   🔍 [JSearch] "${query}" in ${location}`);
    
    const response = await retryWithBackoff(async () => {
      return axios.get('https://jsearch.p.rapidapi.com/search', {
        params: {
          query: `${query} in ${location}`,
          page: '1',
          num_pages: '3',
          date_posted: 'week',
        },
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
        timeout: 30000,
      });
    });
    
    if (response.data?.data) {
      for (const job of response.data.data) {
        jobs.push({
          title: job.job_title || '',
          company: job.employer_name || 'Entreprise',
          location: job.job_city ? `${job.job_city}, ${job.job_country}` : location,
          contractType: detectContractType(job.job_employment_type || job.job_title || ''),
          description: (job.job_description || '').substring(0, 500),
          url: job.job_apply_link || job.job_google_link || '',
          source: 'jsearch',
          postedDate: new Date(job.job_posted_at_datetime_utc || Date.now()),
          skills: extractSkills(job.job_title + ' ' + (job.job_description || '')),
          salary: job.job_min_salary ? `${job.job_min_salary} - ${job.job_max_salary}` : undefined,
        });
      }
    }
    
    console.log(`   ✅ [JSearch] ${jobs.length} offres trouvées`);
  } catch (error: any) {
    console.error(`   ❌ [JSearch] Erreur:`, error.message);
  }
  
  return jobs;
}

/**
 * SOURCE 5: Arbeitnow API - API gratuite sans clé
 */
async function scrapeArbeitnowAPI(query: string, location: string): Promise<JobOffer[]> {
  const jobs: JobOffer[] = [];
  
  try {
    console.log(`   🔍 [Arbeitnow] "${query}" in ${location}`);
    
    const response = await retryWithBackoff(async () => {
      return axios.get('https://www.arbeitnow.com/api/job-board-api', {
        timeout: 15000,
      });
    });
    
    if (response.data?.data) {
      const queryLower = query.toLowerCase();
      const locationLower = location.toLowerCase();
      
      const filtered = response.data.data.filter((job: any) => {
        const text = `${job.title} ${job.company_name} ${job.description || ''} ${job.location}`.toLowerCase();
        const matchesQuery = queryLower.split(' ').some(word => text.includes(word));
        const matchesLocation = !location || text.includes(locationLower) || job.remote;
        return matchesQuery && matchesLocation;
      });
      
      for (const job of filtered.slice(0, 20)) {
        jobs.push({
          title: job.title || '',
          company: job.company_name || 'Entreprise',
          location: job.location || (job.remote ? 'Remote' : location),
          contractType: detectContractType(job.title || ''),
          description: (job.description || '').substring(0, 500),
          url: job.url || '',
          source: 'arbeitnow',
          postedDate: new Date(job.created_at || Date.now()),
          skills: job.tags || extractSkills(job.title + ' ' + (job.description || '')),
        });
      }
    }
    
    console.log(`   ✅ [Arbeitnow] ${jobs.length} offres trouvées`);
  } catch (error: any) {
    console.error(`   ❌ [Arbeitnow] Erreur:`, error.message);
  }
  
  return jobs;
}

/**
 * ANCIENNE SOURCE - Génération de jobs (DÉSACTIVÉE)
 */
function generateRealisticJobs(query: string, location: string, source: string, count: number): JobOffer[] {
  const jobs: JobOffer[] = [];
  
  // Base de données d'entreprises réelles par secteur
  const companiesByDomain: Record<string, string[]> = {
    finance: [
      'BNP Paribas', 'Société Générale', 'Crédit Agricole', 'Natixis', 'AXA',
      'Rothschild & Co', 'Lazard', 'Goldman Sachs', 'JP Morgan', 'Morgan Stanley',
      'HSBC', 'Barclays', 'Deutsche Bank', 'UBS', 'Credit Suisse',
      'BlackRock', 'Amundi', 'Carmignac', 'Tikehau Capital', 'Eurazeo',
    ],
    tech: [
      'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple',
      'Criteo', 'Datadog', 'Doctolib', 'BlaBlaCar', 'Dassault Systèmes',
      'Capgemini', 'Sopra Steria', 'Atos', 'Thales', 'Orange',
      'OVHcloud', 'Scaleway', 'Algolia', 'Contentsquare', 'Mirakl',
    ],
    consulting: [
      'McKinsey', 'BCG', 'Bain & Company', 'Deloitte', 'PwC',
      'EY', 'KPMG', 'Accenture', 'Oliver Wyman', 'Roland Berger',
      'Kearney', 'Strategy&', 'L.E.K. Consulting', 'Simon-Kucher',
    ],
    default: [
      'L\'Oréal', 'LVMH', 'Danone', 'Total Energies', 'Sanofi',
      'Airbus', 'Safran', 'Renault', 'Stellantis', 'Michelin',
      'Carrefour', 'Auchan', 'Veolia', 'Engie', 'EDF',
    ],
  };
  
  // Titres de postes par domaine
  const titlesByDomain: Record<string, string[]> = {
    finance: [
      'Analyste M&A', 'Analyste Crédit', 'Trader Junior', 'Gestionnaire de Portefeuille',
      'Analyste Risques', 'Chargé d\'Affaires', 'Analyste Quantitatif', 'Contrôleur de Gestion',
      'Auditeur Financier', 'Analyste Private Equity',
    ],
    tech: [
      'Développeur Full Stack', 'Data Scientist', 'Ingénieur DevOps', 'Product Manager',
      'Développeur Frontend', 'Développeur Backend', 'Ingénieur Machine Learning',
      'Architecte Cloud', 'Ingénieur QA', 'Scrum Master',
    ],
    consulting: [
      'Consultant Junior', 'Consultant Strategy', 'Business Analyst', 'Associate Consultant',
      'Consultant Digital', 'Consultant Transformation', 'Consultant Data',
    ],
    default: [
      'Chef de Projet', 'Responsable Marketing', 'Business Developer', 'Chargé de Communication',
      'Responsable RH', 'Supply Chain Manager', 'Category Manager',
    ],
  };
  
  // Déterminer le domaine
  const queryLower = query.toLowerCase();
  let domain = 'default';
  if (queryLower.includes('finance') || queryLower.includes('banque') || queryLower.includes('trading')) {
    domain = 'finance';
  } else if (queryLower.includes('tech') || queryLower.includes('développeur') || queryLower.includes('data')) {
    domain = 'tech';
  } else if (queryLower.includes('conseil') || queryLower.includes('consulting')) {
    domain = 'consulting';
  }
  
  const companies = companiesByDomain[domain];
  const titles = titlesByDomain[domain];
  const contractTypes = ['stage', 'alternance', 'cdi'];
  
  for (let i = 0; i < count; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const baseTitle = titles[Math.floor(Math.random() * titles.length)];
    const contractType = contractTypes[Math.floor(Math.random() * contractTypes.length)];
    
    // Adapter le titre selon le type de contrat
    let title = baseTitle;
    if (contractType === 'stage') {
      title = `Stage - ${baseTitle}`;
    } else if (contractType === 'alternance') {
      title = `Alternance - ${baseTitle}`;
    }
    
    jobs.push({
      title,
      company,
      location: location || 'Paris',
      contractType,
      description: `${title} chez ${company}. Rejoignez une équipe dynamique et participez à des projets innovants dans le secteur ${domain}.`,
      url: `https://www.google.com/search?q=${encodeURIComponent(title + ' ' + company + ' emploi')}`,
      source,
      postedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // 0-7 jours
      skills: extractSkills(title + ' ' + domain),
    });
  }
  
  return jobs;
}

/**
 * SOURCE 5: Indeed via scraping HTML
 */
async function scrapeIndeed(query: string, location: string): Promise<JobOffer[]> {
  const jobs: JobOffer[] = [];
  
  try {
    console.log(`   🔍 [Indeed] "${query}" in ${location}`);
    
    const searchUrl = `https://fr.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`;
    
    const response = await retryWithBackoff(async () => {
      return axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        },
        timeout: 15000,
      });
    });
    
    const html = response.data;
    
    // Parser les résultats Indeed avec regex
    const jobCardRegex = /data-jk="([^"]+)"[^>]*>[\s\S]*?<h2[^>]*class="[^"]*jobTitle[^"]*"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>[\s\S]*?<span[^>]*data-testid="company-name"[^>]*>([^<]+)<\/span>[\s\S]*?<div[^>]*data-testid="text-location"[^>]*>([^<]+)<\/div>/gi;
    
    let match;
    let count = 0;
    while ((match = jobCardRegex.exec(html)) !== null && count < 15) {
      const [, jobId, title, company, jobLocation] = match;
      if (title && company) {
        jobs.push({
          title: title.trim(),
          company: company.trim(),
          location: jobLocation?.trim() || location,
          contractType: detectContractType(title),
          description: `Offre ${title} chez ${company}`,
          url: `https://fr.indeed.com/viewjob?jk=${jobId}`,
          source: 'indeed',
          postedDate: new Date(),
          skills: extractSkills(title),
        });
        count++;
      }
    }
    
    // Pas de fallback - uniquement des vraies offres
    
    console.log(`   ✅ [Indeed] ${jobs.length} offres trouvées`);
  } catch (error: any) {
    console.error(`   ❌ [Indeed] Erreur:`, error.message);
    // Pas de fallback - uniquement des vraies offres
  }
  
  return jobs;
}

/**
 * SOURCE 6: Welcome to the Jungle
 */
async function scrapeWTTJ(query: string, location: string): Promise<JobOffer[]> {
  const jobs: JobOffer[] = [];
  
  try {
    console.log(`   🔍 [WTTJ] "${query}" in ${location}`);
    
    // WTTJ API publique
    const response = await retryWithBackoff(async () => {
      return axios.get('https://api.welcometothejungle.com/api/v1/jobs', {
        params: {
          query: query,
          page: 1,
          per_page: 20,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        timeout: 15000,
      });
    });
    
    if (response.data?.jobs) {
      for (const job of response.data.jobs.slice(0, 15)) {
        jobs.push({
          title: job.name || job.title || '',
          company: job.organization?.name || job.company_name || 'Entreprise',
          location: job.office?.city || location,
          contractType: detectContractType(job.contract_type || job.name || ''),
          description: (job.description || '').substring(0, 500),
          url: `https://www.welcometothejungle.com/fr/companies/${job.organization?.slug}/jobs/${job.slug}`,
          source: 'wttj',
          postedDate: new Date(job.published_at || Date.now()),
          skills: extractSkills(job.name + ' ' + (job.description || '')),
        });
      }
    }
    
    // Pas de fallback - uniquement des vraies offres
    
    console.log(`   ✅ [WTTJ] ${jobs.length} offres trouvées`);
  } catch (error: any) {
    console.error(`   ❌ [WTTJ] Erreur:`, error.message);
    // Pas de fallback - uniquement des vraies offres
  }
  
  return jobs;
}

/**
 * SOURCE 7: LinkedIn Jobs (via recherche Google)
 */
async function scrapeLinkedIn(query: string, location: string): Promise<JobOffer[]> {
  const jobs: JobOffer[] = [];
  
  try {
    console.log(`   🔍 [LinkedIn] "${query}" in ${location}`);
    
    // LinkedIn nécessite un scraping réel avec Puppeteer
    // Pour l'instant, on ne retourne rien - utiliser le real-scraper.ts pour LinkedIn
    console.log(`   ⚠️ [LinkedIn] Real scraping requires Puppeteer`);
    
    console.log(`   ✅ [LinkedIn] ${jobs.length} offres trouvées`);
  } catch (error: any) {
    console.error(`   ❌ [LinkedIn] Erreur:`, error.message);
  }
  
  return jobs;
}

/**
 * Générer des offres LinkedIn réalistes
 */
function generateLinkedInJobs(query: string, location: string, count: number): JobOffer[] {
  const jobs: JobOffer[] = [];
  
  const queryLower = query.toLowerCase();
  
  // Entreprises qui recrutent activement sur LinkedIn
  const linkedinCompanies: Record<string, { companies: string[], titles: string[] }> = {
    finance: {
      companies: [
        'Société Générale', 'BNP Paribas', 'Crédit Agricole CIB', 'Natixis', 'HSBC France',
        'Rothschild & Co', 'Lazard', 'Tikehau Capital', 'Ardian', 'PAI Partners',
        'Amundi', 'AXA Investment Managers', 'Carmignac', 'Sycomore AM', 'La Française',
        'Mazars', 'Grant Thornton', 'BDO', 'RSM', 'Accuracy',
      ],
      titles: [
        'Analyste M&A Junior', 'Analyste Crédit', 'Analyste Risques de Marché',
        'Gestionnaire Middle Office', 'Analyste Quantitatif', 'Chargé de Clientèle Entreprises',
        'Auditeur Junior', 'Contrôleur de Gestion', 'Analyste Transaction Services',
        'Associate Private Equity', 'Analyste Structured Finance',
      ],
    },
    stage: {
      companies: [
        'L\'Oréal', 'LVMH', 'Kering', 'Hermès', 'Danone',
        'TotalEnergies', 'Engie', 'EDF', 'Veolia', 'Suez',
        'Airbus', 'Safran', 'Thales', 'Dassault Aviation', 'Naval Group',
        'Orange', 'Bouygues', 'Vinci', 'Eiffage', 'Saint-Gobain',
      ],
      titles: [
        'Stage Analyste Financier', 'Stage Contrôle de Gestion', 'Stage Audit Interne',
        'Stage Marketing Digital', 'Stage Business Development', 'Stage Chef de Projet',
        'Stage Data Analyst', 'Stage Consultant Junior', 'Stage RH',
        'Stage Supply Chain', 'Stage Achats',
      ],
    },
    default: {
      companies: [
        'Capgemini', 'Accenture', 'Sopra Steria', 'CGI', 'Atos',
        'Deloitte', 'PwC', 'EY', 'KPMG', 'McKinsey',
        'BCG', 'Bain & Company', 'Oliver Wyman', 'Roland Berger', 'Kearney',
      ],
      titles: [
        'Consultant Junior', 'Business Analyst', 'Chef de Projet Digital',
        'Consultant Transformation', 'Analyste Data', 'Product Owner',
        'Consultant Strategy', 'Manager de Transition', 'Consultant IT',
      ],
    },
  };
  
  let category = 'default';
  if (queryLower.includes('finance') || queryLower.includes('banque') || queryLower.includes('audit')) {
    category = 'finance';
  } else if (queryLower.includes('stage') || queryLower.includes('intern')) {
    category = 'stage';
  }
  
  const { companies, titles } = linkedinCompanies[category];
  const contractTypes = queryLower.includes('stage') ? ['stage'] : 
                        queryLower.includes('alternance') ? ['alternance'] : 
                        ['stage', 'alternance', 'cdi'];
  
  for (let i = 0; i < count; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const baseTitle = titles[Math.floor(Math.random() * titles.length)];
    const contractType = contractTypes[Math.floor(Math.random() * contractTypes.length)];
    
    let title = baseTitle;
    if (!baseTitle.toLowerCase().includes('stage') && contractType === 'stage') {
      title = `Stage - ${baseTitle}`;
    } else if (contractType === 'alternance') {
      title = `Alternance - ${baseTitle.replace('Stage ', '')}`;
    }
    
    jobs.push({
      title,
      company,
      location: location || 'Paris',
      contractType,
      description: `${title} chez ${company}. Rejoignez une équipe dynamique dans un environnement stimulant.`,
      url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title + ' ' + company)}`,
      source: 'linkedin',
      postedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      skills: extractSkills(title + ' ' + category),
    });
  }
  
  return jobs;
}

/**
 * SCRAPER PRINCIPAL ULTRA PERFORMANT
 */
export async function ultraScrape(query: string, location: string = "Paris"): Promise<JobOffer[]> {
  const cacheKey = `${query.toLowerCase()}-${location.toLowerCase()}`;
  
  // Vérifier le cache (réduit à 2 minutes pour plus de fraîcheur)
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`   📦 [Cache] ${cached.data.length} offres depuis le cache`);
    return cached.data;
  }
  
  console.log(`\n🚀 ============================================`);
  console.log(`🚀 ULTRA SCRAPER - Recherche: "${query}" à ${location}`);
  console.log(`🚀 ============================================\n`);
  
  const startTime = Date.now();
  const allJobs: JobOffer[] = [];
  
  // Générer des variantes de recherche pour plus de résultats
  const queryVariants = generateQueryVariants(query);
  
  // Lancer toutes les sources en parallèle avec plus de requêtes
  const results = await Promise.allSettled([
    // Google Jobs via SerpAPI - plusieurs variantes
    scrapeGoogleJobsAPI(query, location),
    scrapeGoogleJobsAPI(`${query} stage`, location),
    scrapeGoogleJobsAPI(`${query} alternance`, location),
    scrapeGoogleJobsAPI(`${query} junior`, location),
    
    // JSearch API (RapidAPI) - vraies offres
    scrapeJSearchAPI(query, location),
    scrapeJSearchAPI(`${query} stage`, location),
    scrapeJSearchAPI(`${query} internship`, location),
    
    // Arbeitnow API - gratuite sans clé
    scrapeArbeitnowAPI(query, location),
    
    // Indeed scraping
    scrapeIndeed(query, location),
    scrapeIndeed(`${query} stage`, location),
    
    // WTTJ API
    scrapeWTTJ(query, location),
    
    // RemoteOK API
    scrapeRemoteOK(query),
    
    // Recherches avec variantes de mots-clés
    ...queryVariants.slice(0, 3).map(variant => scrapeJSearchAPI(variant, location)),
  ]);
  
  // Collecter les résultats
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      allJobs.push(...result.value);
    }
  });
  
  console.log(`\n📊 Total brut: ${allJobs.length} offres`);
  
  // NE PAS générer d'offres fictives - uniquement des vraies offres
  console.log(`   📊 Offres réelles trouvées: ${allJobs.length}`);
  
  // Dédupliquer par titre + entreprise
  const uniqueJobs = Array.from(
    new Map(allJobs.map(job => [`${job.title.toLowerCase()}-${job.company.toLowerCase()}`, job])).values()
  );
  
  // Trier par date (plus récent en premier)
  uniqueJobs.sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime());
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ ULTRA SCRAPER: ${uniqueJobs.length} offres uniques en ${duration}s`);
  console.log(`🚀 ============================================\n`);
  
  // Mettre en cache
  cache.set(cacheKey, { data: uniqueJobs, timestamp: Date.now() });
  
  return uniqueJobs;
}

/**
 * Générer des variantes de recherche pour plus de résultats
 */
function generateQueryVariants(query: string): string[] {
  const variants: string[] = [];
  const queryLower = query.toLowerCase();
  
  // Synonymes et variantes
  const synonyms: Record<string, string[]> = {
    'finance': ['banque', 'investissement', 'gestion actifs', 'M&A', 'audit financier'],
    'banque': ['finance', 'crédit', 'risques bancaires', 'front office'],
    'trading': ['sales trading', 'trader', 'marchés financiers', 'derivatives'],
    'consulting': ['conseil', 'strategy', 'management consulting'],
    'tech': ['développeur', 'software engineer', 'IT', 'digital'],
    'data': ['data analyst', 'data scientist', 'business intelligence', 'analytics'],
    'marketing': ['digital marketing', 'growth', 'brand manager', 'communication'],
  };
  
  for (const [key, values] of Object.entries(synonyms)) {
    if (queryLower.includes(key)) {
      variants.push(...values);
    }
  }
  
  return variants;
}

/**
 * Détecter le type de contrat
 */
function detectContractType(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('stage') || lowerText.includes('intern') || lowerText.includes('stagiaire')) return 'stage';
  if (lowerText.includes('alternance') || lowerText.includes('apprenti') || lowerText.includes('contrat pro')) return 'alternance';
  if (lowerText.includes('cdd') || lowerText.includes('temporary') || lowerText.includes('déterminée')) return 'cdd';
  if (lowerText.includes('freelance') || lowerText.includes('indépendant') || lowerText.includes('mission')) return 'freelance';
  
  return 'cdi';
}

/**
 * Parser la date
 */
function parseDate(dateStr: string | undefined): Date {
  if (!dateStr) return new Date();
  
  const lowerText = dateStr.toLowerCase();
  const now = new Date();
  
  if (lowerText.includes('aujourd') || lowerText.includes('today') || lowerText.includes('just')) {
    return now;
  }
  if (lowerText.includes('hier') || lowerText.includes('yesterday')) {
    return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  const daysMatch = lowerText.match(/(\d+)\s*(jour|day)/);
  if (daysMatch) {
    return new Date(now.getTime() - parseInt(daysMatch[1]) * 24 * 60 * 60 * 1000);
  }
  
  const weeksMatch = lowerText.match(/(\d+)\s*(semaine|week)/);
  if (weeksMatch) {
    return new Date(now.getTime() - parseInt(weeksMatch[1]) * 7 * 24 * 60 * 60 * 1000);
  }
  
  return now;
}

/**
 * Extraire les compétences
 */
function extractSkills(text: string): string[] {
  const skillsDB = [
    // Tech
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue', 'Node.js', 'Django', 'Flask', 'Spring', 'Laravel',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'CI/CD', 'DevOps',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'AI',
    
    // Finance
    'Excel', 'VBA', 'Bloomberg', 'Reuters', 'Financial Modeling', 'Valuation',
    'M&A', 'DCF', 'LBO', 'Trading', 'Risk Management', 'Portfolio Management',
    'Investment Banking', 'Private Equity', 'Asset Management', 'Hedge Fund',
    'IFRS', 'Comptabilité', 'Audit', 'Contrôle de Gestion',
    
    // Business
    'Project Management', 'Agile', 'Scrum', 'Product Management', 'Lean',
    'Marketing', 'Sales', 'CRM', 'Salesforce', 'SAP', 'ERP',
    'PowerPoint', 'Tableau', 'Power BI', 'Data Analysis',
    
    // Langues
    'Anglais', 'English', 'Français', 'French', 'Espagnol', 'Allemand',
  ];
  
  const found: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const skill of skillsDB) {
    if (lowerText.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  }
  
  return [...new Set(found)];
}

export type { JobOffer };
