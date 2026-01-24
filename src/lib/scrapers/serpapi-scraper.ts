/**
 * SERPAPI SCRAPER - Utilise l'API Google Jobs via SerpAPI
 * Plus fiable que Puppeteer car pas de blocage anti-bot
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

/**
 * Scraper Google Jobs via SerpAPI
 */
export async function scrapeGoogleJobs(query: string, location: string): Promise<JobOffer[]> {
  const jobs: JobOffer[] = [];
  
  if (!SERPAPI_KEY) {
    console.log('⚠️ [SerpAPI] No API key configured');
    return jobs;
  }
  
  try {
    console.log(`🔍 [SerpAPI] Searching: "${query}" in ${location}`);
    
    // Construire la requête pour les stages/emplois
    const searchQuery = `${query} stage OR alternance OR emploi`;
    
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_jobs',
        q: searchQuery,
        location: location,
        hl: 'fr',
        gl: 'fr',
        api_key: SERPAPI_KEY,
      },
      timeout: 30000,
    });
    
    const data = response.data;
    
    if (data.jobs_results && Array.isArray(data.jobs_results)) {
      console.log(`📊 [SerpAPI] Found ${data.jobs_results.length} jobs`);
      
      for (const job of data.jobs_results) {
        jobs.push({
          title: job.title || '',
          company: job.company_name || '',
          location: job.location || location,
          contractType: detectContractType(job.title + ' ' + (job.description || '')),
          description: job.description || '',
          url: job.apply_options?.[0]?.link || job.share_link || '',
          source: 'google_jobs',
          postedDate: parsePostedDate(job.detected_extensions?.posted_at),
          skills: extractSkillsFromText(job.description || ''),
          salary: job.detected_extensions?.salary || undefined,
        });
      }
    }
    
    console.log(`✅ [SerpAPI] Scraped ${jobs.length} jobs`);
  } catch (error) {
    console.error('❌ [SerpAPI] Error:', error);
  }
  
  return jobs;
}

/**
 * Scraper Indeed via SerpAPI
 */
export async function scrapeIndeedViaSerpAPI(query: string, location: string): Promise<JobOffer[]> {
  const jobs: JobOffer[] = [];
  
  if (!SERPAPI_KEY) {
    console.log('⚠️ [SerpAPI Indeed] No API key configured');
    return jobs;
  }
  
  try {
    console.log(`🔍 [SerpAPI Indeed] Searching: "${query}" in ${location}`);
    
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google',
        q: `site:indeed.fr ${query} ${location}`,
        hl: 'fr',
        gl: 'fr',
        num: 20,
        api_key: SERPAPI_KEY,
      },
      timeout: 30000,
    });
    
    const data = response.data;
    
    if (data.organic_results && Array.isArray(data.organic_results)) {
      console.log(`📊 [SerpAPI Indeed] Found ${data.organic_results.length} results`);
      
      for (const result of data.organic_results) {
        // Filtrer uniquement les résultats Indeed
        if (result.link && result.link.includes('indeed')) {
          // Extraire le titre et l'entreprise du snippet
          const titleMatch = result.title?.match(/^(.+?)\s*[-–]\s*(.+?)(?:\s*[-–]|$)/);
          
          jobs.push({
            title: titleMatch?.[1] || result.title || '',
            company: titleMatch?.[2] || 'Entreprise',
            location: location,
            contractType: detectContractType(result.title + ' ' + (result.snippet || '')),
            description: result.snippet || '',
            url: result.link,
            source: 'indeed',
            postedDate: new Date(),
            skills: extractSkillsFromText(result.snippet || ''),
          });
        }
      }
    }
    
    console.log(`✅ [SerpAPI Indeed] Scraped ${jobs.length} jobs`);
  } catch (error) {
    console.error('❌ [SerpAPI Indeed] Error:', error);
  }
  
  return jobs;
}

/**
 * Scraper LinkedIn via recherche Google
 */
export async function scrapeLinkedInViaSerpAPI(query: string, location: string): Promise<JobOffer[]> {
  const jobs: JobOffer[] = [];
  
  if (!SERPAPI_KEY) {
    return jobs;
  }
  
  try {
    console.log(`🔍 [SerpAPI LinkedIn] Searching: "${query}" in ${location}`);
    
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google',
        q: `site:linkedin.com/jobs ${query} ${location}`,
        hl: 'fr',
        gl: 'fr',
        num: 20,
        api_key: SERPAPI_KEY,
      },
      timeout: 30000,
    });
    
    const data = response.data;
    
    if (data.organic_results && Array.isArray(data.organic_results)) {
      for (const result of data.organic_results) {
        if (result.link && result.link.includes('linkedin.com/jobs')) {
          const titleMatch = result.title?.match(/^(.+?)\s*[-–|]\s*(.+?)(?:\s*[-–|]|$)/);
          
          jobs.push({
            title: titleMatch?.[1] || result.title || '',
            company: titleMatch?.[2] || 'Entreprise',
            location: location,
            contractType: detectContractType(result.title + ' ' + (result.snippet || '')),
            description: result.snippet || '',
            url: result.link,
            source: 'linkedin',
            postedDate: new Date(),
            skills: extractSkillsFromText(result.snippet || ''),
          });
        }
      }
    }
    
    console.log(`✅ [SerpAPI LinkedIn] Scraped ${jobs.length} jobs`);
  } catch (error) {
    console.error('❌ [SerpAPI LinkedIn] Error:', error);
  }
  
  return jobs;
}

/**
 * SCRAPER PRINCIPAL via SerpAPI
 */
export async function scrapeAllViaSerpAPI(query: string, location: string = "Paris"): Promise<JobOffer[]> {
  console.log(`\n🚀 SERPAPI SCRAPER - Searching for jobs`);
  console.log(`📍 Query: "${query}" in ${location}\n`);
  
  const startTime = Date.now();
  
  // Scraper en parallèle
  const results = await Promise.allSettled([
    scrapeGoogleJobs(query, location),
    scrapeIndeedViaSerpAPI(query, location),
    scrapeLinkedInViaSerpAPI(query, location),
  ]);
  
  const allJobs: JobOffer[] = [];
  
  results.forEach((result, index) => {
    const sources = ['Google Jobs', 'Indeed', 'LinkedIn'];
    if (result.status === 'fulfilled') {
      allJobs.push(...result.value);
      console.log(`✅ ${sources[index]}: ${result.value.length} jobs`);
    } else {
      console.error(`❌ ${sources[index]} failed:`, result.reason?.message || result.reason);
    }
  });
  
  // Dédupliquer par titre + entreprise
  const uniqueJobs = Array.from(
    new Map(allJobs.map(job => [`${job.title}-${job.company}`, job])).values()
  );
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ TOTAL: ${uniqueJobs.length} unique jobs via SerpAPI in ${duration}s\n`);
  
  return uniqueJobs;
}

/**
 * Détecter le type de contrat
 */
function detectContractType(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('stage') || lowerText.includes('intern') || lowerText.includes('stagiaire')) return 'stage';
  if (lowerText.includes('alternance') || lowerText.includes('apprenti') || lowerText.includes('contrat pro')) return 'alternance';
  if (lowerText.includes('cdi') || lowerText.includes('permanent') || lowerText.includes('indéterminée')) return 'cdi';
  if (lowerText.includes('cdd') || lowerText.includes('temporary') || lowerText.includes('déterminée')) return 'cdd';
  if (lowerText.includes('freelance') || lowerText.includes('indépendant') || lowerText.includes('mission')) return 'freelance';
  
  return 'cdi';
}

/**
 * Parser la date de publication
 */
function parsePostedDate(postedAt: string | undefined): Date {
  if (!postedAt) return new Date();
  
  const lowerText = postedAt.toLowerCase();
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
 * Extraire les compétences du texte
 */
function extractSkillsFromText(text: string): string[] {
  const skills = [
    // Tech
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'CI/CD',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Science',
    
    // Finance
    'Excel', 'VBA', 'Bloomberg', 'Reuters', 'Financial Modeling', 'Valuation',
    'M&A', 'DCF', 'LBO', 'Trading', 'Risk Management', 'Portfolio Management',
    'Investment Banking', 'Private Equity', 'Asset Management', 'Hedge Fund',
    
    // Business
    'Project Management', 'Agile', 'Scrum', 'Product Management',
    'Marketing', 'Sales', 'CRM', 'Salesforce', 'SAP',
    'PowerPoint', 'Tableau', 'Power BI',
    
    // Langues
    'English', 'Anglais', 'French', 'Français', 'Spanish', 'German',
  ];
  
  const found: string[] = [];
  const lowerText = text.toLowerCase();
  
  skills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  });
  
  return [...new Set(found)]; // Dédupliquer
}

export type { JobOffer };
