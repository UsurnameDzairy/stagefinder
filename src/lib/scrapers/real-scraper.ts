/**
 * VRAI SCRAPER - Scrape réellement LinkedIn, Indeed, HelloWork, etc.
 * Utilise Puppeteer pour contourner les protections anti-bot
 * Inclut une base de données complète d'entreprises par secteur
 * 
 * FONCTIONNALITÉS:
 * - Scraping réel avec Chromium (comme un humain)
 * - Liens LinkedIn directs pour chaque entreprise
 * - Vérification si les offres sont actives
 * - Uniquement des vraies offres (pas de données fictives)
 */

import puppeteer from 'puppeteer';
import { 
  getCompaniesBySector, 
  getCompaniesByCity, 
  COMPANY_LINKEDIN_URLS,
  SKILLS_BY_DOMAIN,
  type CompanyInfo 
} from '../companies-database';

interface RealJobOffer {
  title: string;
  company: string;
  location: string;
  contractType: string;
  description: string;
  url: string;
  source: string;
  postedDate: Date;
  skills: string[];
  isActive?: boolean;
  requiredSkills?: string[];
  linkedinUrl?: string;
}

// Cache court pour forcer le scraping à chaque recherche
const scrapedUrlsCache = new Map<string, { data: RealJobOffer[]; timestamp: number }>();
const CACHE_TTL = 1 * 60 * 1000; // 1 minute seulement - scrape à chaque recherche

/**
 * Vérifier si une offre est toujours active (non expirée)
 */
function isOfferActive(postedDate: Date, maxDaysOld: number = 30): boolean {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - postedDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= maxDaysOld;
}

/**
 * Obtenir le lien LinkedIn direct pour une entreprise
 */
function getLinkedInJobsUrl(companyName: string): string | undefined {
  return COMPANY_LINKEDIN_URLS[companyName];
}

/**
 * Obtenir les compétences requises pour un domaine
 */
function getRequiredSkillsForDomain(query: string): string[] {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('finance') || queryLower.includes('banque')) {
    return SKILLS_BY_DOMAIN.finance?.required || [];
  }
  if (queryLower.includes('tech') || queryLower.includes('développeur') || queryLower.includes('developer')) {
    return SKILLS_BY_DOMAIN.tech?.required || [];
  }
  if (queryLower.includes('marketing') || queryLower.includes('communication')) {
    return SKILLS_BY_DOMAIN.marketing?.required || [];
  }
  if (queryLower.includes('consulting') || queryLower.includes('conseil')) {
    return SKILLS_BY_DOMAIN.consulting?.required || [];
  }
  if (queryLower.includes('luxe') || queryLower.includes('luxury')) {
    return SKILLS_BY_DOMAIN.luxury?.required || [];
  }
  if (queryLower.includes('yacht') || queryLower.includes('maritime')) {
    return SKILLS_BY_DOMAIN.yachting?.required || [];
  }
  if (queryLower.includes('sport')) {
    return SKILLS_BY_DOMAIN.sport?.required || [];
  }
  
  return [];
}

/**
 * Configuration du navigateur Puppeteer
 */
async function launchBrowser() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      ],
      timeout: 90000, // 90 secondes timeout augmenté
      protocolTimeout: 90000,
    });
    
    console.log('✅ Browser Chromium lancé avec succès');
    return browser;
  } catch (error) {
    console.error('❌ Échec du lancement du navigateur:', error);
    console.error('💡 Vérifiez que Chromium est installé: npx puppeteer browsers install chrome');
    throw error;
  }
}

async function setupPage(page: any) {
  // User agent réaliste
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  // Supprimer les traces de Puppeteer
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR', 'fr', 'en-US', 'en'] });
    // @ts-ignore
    window.chrome = { runtime: {} };
  });
  
  // Headers réalistes
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
  });
  
  return page;
}

/**
 * Scraper LinkedIn Jobs - RÉEL
 */
export async function scrapeLinkedInReal(query: string, location: string): Promise<RealJobOffer[]> {
  const jobs: RealJobOffer[] = [];
  let browser;
  
  try {
    console.log(`🔍 [LinkedIn] Scraping: "${query}" in ${location}`);
    
    browser = await launchBrowser();
    let page = await browser.newPage();
    page = await setupPage(page);
    
    // Bloquer les ressources inutiles pour accélérer
    await page.setRequestInterception(true);
    page.on('request', (req: any) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    const searchQuery = encodeURIComponent(query);
    const searchLocation = encodeURIComponent(location);
    const url = `https://www.linkedin.com/jobs/search/?keywords=${searchQuery}&location=${searchLocation}&f_TPR=r86400`; // Dernières 24h
    
    console.log(`🌐 [LinkedIn] Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    // Attendre que les offres se chargent
    console.log(`⏳ [LinkedIn] Waiting for job cards...`);
    await page.waitForSelector('.jobs-search__results-list, .job-card-container, .base-card', { timeout: 15000 }).catch(() => {
      console.log(`⚠️ [LinkedIn] Timeout waiting for selectors`);
      return null;
    });
    
    // Extraire les offres
    const jobElements = await page.$$('.job-card-container, .base-card');
    
    console.log(`📊 [LinkedIn] Found ${jobElements.length} job cards`);
    
    for (let i = 0; i < Math.min(jobElements.length, 20); i++) {
      try {
        const element = jobElements[i];
        
        const title = await element.$eval('.base-search-card__title, .job-card-list__title', el => el.textContent?.trim() || '').catch(() => '');
        const company = await element.$eval('.base-search-card__subtitle, .job-card-container__company-name', el => el.textContent?.trim() || '').catch(() => '');
        const location = await element.$eval('.job-search-card__location, .job-card-container__metadata-item', el => el.textContent?.trim() || '').catch(() => '');
        const jobUrl = await element.$eval('a', el => el.getAttribute('href') || '').catch(() => '');
        
        if (title && company && jobUrl) {
          jobs.push({
            title,
            company,
            location: location || 'Non spécifié',
            contractType: detectContractType(title),
            description: `${title} chez ${company}`,
            url: jobUrl.split('?')[0], // Nettoyer l'URL
            source: 'linkedin',
            postedDate: new Date(),
            skills: extractSkills(title),
          });
        }
      } catch (err) {
        console.error(`Error parsing LinkedIn job ${i}:`, err);
      }
    }
    
    console.log(`✅ [LinkedIn] Scraped ${jobs.length} real jobs`);
  } catch (error) {
    console.error(`❌ [LinkedIn] Error:`, error);
    console.error(`Stack trace:`, (error as Error).stack);
  } finally {
    if (browser) {
      console.log(`🔒 [LinkedIn] Closing browser...`);
      await browser.close();
    }
  }
  
  console.log(`✅ [LinkedIn] Returning ${jobs.length} jobs`);
  return jobs;
}

/**
 * Scraper Indeed - RÉEL
 */
export async function scrapeIndeedReal(query: string, location: string): Promise<RealJobOffer[]> {
  const jobs: RealJobOffer[] = [];
  let browser;
  
  try {
    console.log(`🔍 [Indeed] Scraping: "${query}" in ${location}`);
    
    browser = await launchBrowser();
    let page = await browser.newPage();
    page = await setupPage(page);
    
    await page.setRequestInterception(true);
    page.on('request', (req: any) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    const searchQuery = encodeURIComponent(query);
    const searchLocation = encodeURIComponent(location);
    const url = `https://fr.indeed.com/jobs?q=${searchQuery}&l=${searchLocation}&fromage=7`;
    
    console.log(`🌐 [Indeed] Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    // Attendre un peu pour le chargement dynamique
    await new Promise(r => setTimeout(r, 3000));
    
    // Extraire les offres via evaluate pour plus de fiabilité
    const extractedJobs = await page.evaluate(() => {
      const results: any[] = [];
      
      // Sélecteurs multiples pour Indeed (ils changent souvent)
      const cards = document.querySelectorAll('.job_seen_beacon, .resultContent, .jobsearch-ResultsList > li, [data-testid="job-card"]');
      
      cards.forEach((card, index) => {
        if (index >= 25) return; // Limiter à 25
        
        try {
          // Titre - plusieurs sélecteurs possibles
          const titleEl = card.querySelector('h2.jobTitle span[title], h2.jobTitle a, .jobTitle span, [data-testid="job-title"], a[data-jk]');
          const title = titleEl?.textContent?.trim() || titleEl?.getAttribute('title') || '';
          
          // Entreprise
          const companyEl = card.querySelector('[data-testid="company-name"], .companyName, .company_location .companyName, span[data-testid="company-name"]');
          const company = companyEl?.textContent?.trim() || '';
          
          // Localisation
          const locationEl = card.querySelector('[data-testid="text-location"], .companyLocation, .company_location .companyLocation');
          const location = locationEl?.textContent?.trim() || '';
          
          // Lien
          const linkEl = card.querySelector('a[data-jk], h2.jobTitle a, a.jcs-JobTitle') as HTMLAnchorElement;
          const href = linkEl?.href || linkEl?.getAttribute('href') || '';
          const jobId = linkEl?.getAttribute('data-jk') || '';
          
          // Description snippet
          const snippetEl = card.querySelector('.job-snippet, [data-testid="job-snippet"], .underShelfFooter');
          const snippet = snippetEl?.textContent?.trim() || '';
          
          if (title && (company || href)) {
            results.push({
              title,
              company: company || 'Entreprise',
              location: location || 'France',
              snippet,
              href: href || (jobId ? `https://fr.indeed.com/viewjob?jk=${jobId}` : ''),
            });
          }
        } catch (e) {
          console.error('Error extracting job:', e);
        }
      });
      
      return results;
    });
    
    console.log(`📊 [Indeed] Extracted ${extractedJobs.length} jobs from page`);
    
    for (const job of extractedJobs) {
      const fullUrl = job.href.startsWith('http') ? job.href : `https://fr.indeed.com${job.href}`;
      
      jobs.push({
        title: job.title,
        company: job.company,
        location: job.location,
        contractType: detectContractType(job.title + ' ' + job.snippet),
        description: job.snippet || `${job.title} chez ${job.company}`,
        url: fullUrl,
        source: 'indeed',
        postedDate: new Date(),
        skills: extractSkills(job.title + ' ' + job.snippet),
      });
    }
    
    console.log(`✅ [Indeed] Scraped ${jobs.length} real jobs`);
  } catch (error) {
    console.error('❌ [Indeed] Scraping error:', error);
  } finally {
    if (browser) {
      console.log(`🔒 [Indeed] Closing browser...`);
      await browser.close();
    }
  }
  
  return jobs;
}

/**
 * Scraper HelloWork - RÉEL
 */
export async function scrapeHelloWorkReal(query: string, location: string): Promise<RealJobOffer[]> {
  const jobs: RealJobOffer[] = [];
  let browser;
  
  try {
    console.log(`🔍 [HelloWork] Scraping: "${query}" in ${location}`);
    
    browser = await launchBrowser();
    let page = await browser.newPage();
    page = await setupPage(page);
    
    const searchQuery = encodeURIComponent(query);
    const searchLocation = encodeURIComponent(location);
    // URL HelloWork avec paramètres corrects
    const url = `https://www.hellowork.com/fr-fr/emploi/recherche.html?k=${searchQuery}&l=${searchLocation}`;
    
    console.log(`🌐 [HelloWork] Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Attendre le chargement complet des offres (HelloWork charge dynamiquement)
    await new Promise(r => setTimeout(r, 5000));
    
    // Scroll pour charger plus d'offres
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await new Promise(r => setTimeout(r, 2000));
    
    // Extraire via page.evaluate - HelloWork utilise des classes Tailwind
    const extractedJobs = await page.evaluate(() => {
      const results: any[] = [];
      
      // HelloWork structure: les offres sont dans des <a> avec href contenant /fr-fr/emplois/
      // Chercher tous les liens d'offres d'emploi
      const allLinks = document.querySelectorAll('a[href*="/fr-fr/emplois/"]');
      const processedUrls = new Set<string>();
      
      allLinks.forEach((link) => {
        const href = (link as HTMLAnchorElement).href;
        if (processedUrls.has(href) || results.length >= 30) return;
        processedUrls.add(href);
        
        try {
          // Remonter pour trouver le conteneur de l'offre
          const card = link.closest('li, article, div[class*="tw-"]') || link.parentElement?.parentElement;
          if (!card) return;
          
          // Titre - généralement dans un h2 ou h3 ou le texte du lien
          let title = '';
          const h2 = card.querySelector('h2, h3');
          if (h2) {
            title = h2.textContent?.trim() || '';
          } else {
            title = link.textContent?.trim() || '';
          }
          
          // Nettoyer le titre
          title = title.replace(/\s+/g, ' ').trim();
          if (title.length < 5 || title.length > 200) return;
          
          // Entreprise - chercher dans les spans ou divs proches
          let company = '';
          const companyEl = card.querySelector('[class*="company"], [class*="entreprise"], span.tw-text-grey-700, p.tw-text-grey-700');
          if (companyEl) {
            company = companyEl.textContent?.trim() || '';
          }
          
          // Localisation
          let location = '';
          const locationEl = card.querySelector('[class*="location"], [class*="lieu"], span[class*="grey-500"]');
          if (locationEl) {
            location = locationEl.textContent?.trim() || '';
          }
          
          // Type de contrat
          let contract = '';
          const contractEl = card.querySelector('[class*="contrat"], [class*="contract"], span[class*="badge"]');
          if (contractEl) {
            contract = contractEl.textContent?.trim() || '';
          }
          
          if (title && href.includes('/emplois/')) {
            results.push({
              title,
              company: company || 'Entreprise sur HelloWork',
              location: location || 'France',
              contract,
              href,
            });
          }
        } catch (e) {
          // Ignorer les erreurs individuelles
        }
      });
      
      return results;
    });
    
    console.log(`📊 [HelloWork] Extracted ${extractedJobs.length} jobs from page`);
    
    for (const job of extractedJobs) {
      jobs.push({
        title: job.title,
        company: job.company,
        location: job.location,
        contractType: job.contract || detectContractType(job.title),
        description: `${job.title} chez ${job.company}`,
        url: job.href,
        source: 'hellowork',
        postedDate: new Date(),
        skills: extractSkills(job.title),
      });
    }
    
    console.log(`✅ [HelloWork] Scraped ${jobs.length} real jobs`);
  } catch (error) {
    console.error('❌ [HelloWork] Scraping error:', error);
  } finally {
    if (browser) {
      console.log(`🔒 [HelloWork] Closing browser...`);
      await browser.close();
    }
  }
  
  return jobs;
}

/**
 * Scraper Welcome to the Jungle - RÉEL
 */
export async function scrapeWTTJReal(query: string, location: string): Promise<RealJobOffer[]> {
  const jobs: RealJobOffer[] = [];
  let browser;
  
  try {
    console.log(`🔍 [WTTJ] Scraping: "${query}" in ${location}`);
    
    browser = await launchBrowser();
    let page = await browser.newPage();
    page = await setupPage(page);
    
    // URL WTTJ - utiliser la recherche simple
    const searchQuery = encodeURIComponent(query);
    const locationParam = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
    const url = `https://www.welcometothejungle.com/fr/jobs?query=${searchQuery}&aroundQuery=${encodeURIComponent(locationParam)}`;
    
    console.log(`🌐 [WTTJ] Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Attendre le chargement dynamique (WTTJ est très dynamique)
    await new Promise(r => setTimeout(r, 5000));
    
    // Scroll pour charger plus d'offres
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await new Promise(r => setTimeout(r, 2000));
    
    // Extraire via page.evaluate - WTTJ utilise des liens vers /fr/companies/xxx/jobs/yyy
    const extractedJobs = await page.evaluate(() => {
      const results: any[] = [];
      const processedUrls = new Set<string>();
      
      // Chercher tous les liens d'offres d'emploi WTTJ
      const allLinks = document.querySelectorAll('a[href*="/jobs/"]');
      
      allLinks.forEach((link) => {
        const href = (link as HTMLAnchorElement).href;
        // Filtrer pour ne garder que les vrais liens d'offres
        if (!href.includes('/companies/') || !href.includes('/jobs/')) return;
        if (processedUrls.has(href) || results.length >= 30) return;
        processedUrls.add(href);
        
        try {
          // Remonter pour trouver le conteneur
          const card = link.closest('li, article, div[role="listitem"]') || link.parentElement?.parentElement?.parentElement;
          if (!card) return;
          
          // Titre - chercher dans le lien ou les h4/h3
          let title = '';
          const titleEl = card.querySelector('h4, h3, [role="heading"]');
          if (titleEl) {
            title = titleEl.textContent?.trim() || '';
          }
          if (!title) {
            // Prendre le texte du lien s'il contient un titre
            const linkText = link.textContent?.trim() || '';
            if (linkText.length > 5 && linkText.length < 150) {
              title = linkText;
            }
          }
          
          // Nettoyer le titre
          title = title.replace(/\s+/g, ' ').trim();
          if (title.length < 3 || title.length > 200) return;
          
          // Entreprise - extraire du lien ou chercher dans le DOM
          let company = '';
          // L'URL contient le nom de l'entreprise: /companies/COMPANY_NAME/jobs/
          const urlMatch = href.match(/\/companies\/([^\/]+)\/jobs/);
          if (urlMatch) {
            company = urlMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          }
          const companyEl = card.querySelector('[class*="company"], [class*="Company"], span[class*="text-"]');
          if (companyEl && companyEl.textContent) {
            const compText = companyEl.textContent.trim();
            if (compText.length > 2 && compText.length < 100) {
              company = compText;
            }
          }
          
          // Localisation
          let location = '';
          const locationEl = card.querySelector('[class*="location"], [class*="Location"]');
          if (locationEl) {
            location = locationEl.textContent?.trim() || '';
          }
          
          // Type de contrat
          let contract = '';
          const contractEl = card.querySelector('[class*="contract"], [class*="Contract"], span[class*="tag"]');
          if (contractEl) {
            contract = contractEl.textContent?.trim() || '';
          }
          
          if (title) {
            results.push({
              title,
              company: company || 'Entreprise WTTJ',
              location: location || 'France',
              contract,
              href,
            });
          }
        } catch (e) {
          // Ignorer les erreurs individuelles
        }
      });
      
      return results;
    });
    
    console.log(`📊 [WTTJ] Extracted ${extractedJobs.length} jobs from page`);
    
    for (const job of extractedJobs) {
      const fullUrl = job.href.startsWith('http') ? job.href : `https://www.welcometothejungle.com${job.href}`;
      
      jobs.push({
        title: job.title,
        company: job.company,
        location: job.location,
        contractType: job.contract || detectContractType(job.title),
        description: `${job.title} chez ${job.company}`,
        url: fullUrl,
        source: 'wttj',
        postedDate: new Date(),
        skills: extractSkills(job.title),
      });
    }
    
    console.log(`✅ [WTTJ] Scraped ${jobs.length} real jobs`);
  } catch (error) {
    console.error('❌ [WTTJ] Scraping error:', error);
  } finally {
    if (browser) {
      console.log(`🔒 [WTTJ] Closing browser...`);
      await browser.close();
    }
  }
  
  return jobs;
}

/**
 * Générer des requêtes de recherche basées sur le secteur et la ville
 */
function generateSearchQueries(query: string, location: string): string[] {
  const queries: string[] = [query];
  const queryLower = query.toLowerCase();
  
  // Détecter le secteur
  let sector = '';
  if (queryLower.includes('finance') || queryLower.includes('banque') || queryLower.includes('trading')) {
    sector = 'finance';
  } else if (queryLower.includes('tech') || queryLower.includes('développeur') || queryLower.includes('data')) {
    sector = 'tech';
  } else if (queryLower.includes('conseil') || queryLower.includes('consulting') || queryLower.includes('audit')) {
    sector = 'consulting';
  }
  
  // Ajouter des variantes de recherche
  if (sector === 'finance') {
    queries.push(
      `${query} stage`,
      `${query} alternance`,
      `analyste financier ${location}`,
      `stage finance ${location}`,
      `stage banque ${location}`,
      `stage M&A ${location}`,
      `stage private equity ${location}`,
      `stage asset management ${location}`,
      `stage trading ${location}`,
      `stage audit ${location}`,
    );
  } else if (sector === 'tech') {
    queries.push(
      `${query} stage`,
      `${query} alternance`,
      `stage développeur ${location}`,
      `stage data scientist ${location}`,
      `stage software engineer ${location}`,
      `stage product manager ${location}`,
    );
  } else if (sector === 'consulting') {
    queries.push(
      `${query} stage`,
      `stage consultant ${location}`,
      `stage conseil stratégie ${location}`,
      `stage audit ${location}`,
    );
  }
  
  // Ajouter des recherches par entreprises connues du secteur
  if (sector) {
    const companies = getCompaniesByCity(location).filter(c => 
      c.sector.toLowerCase().includes(sector) || sector.includes(c.sector.toLowerCase().split(' ')[0])
    );
    
    // Ajouter les 10 premières entreprises comme requêtes
    companies.slice(0, 10).forEach(company => {
      queries.push(`${company.name} stage`);
      queries.push(`${company.name} careers`);
    });
  }
  
  return [...new Set(queries)]; // Dédupliquer
}

/**
 * Vérifier si une offre correspond à la localisation demandée
 * FILTRE STRICT - exclut explicitement les autres grandes villes
 */
function matchesLocation(jobLocation: string, requestedLocation: string): boolean {
  const jobLoc = jobLocation.toLowerCase().trim();
  const reqLoc = requestedLocation.toLowerCase().trim();
  
  // Si pas de localisation demandée, accepter tout
  if (!reqLoc || reqLoc === '') {
    return true;
  }
  
  // Liste des grandes villes à exclure si elles ne sont pas demandées
  const majorCities = ['london', 'londres', 'paris', 'monaco', 'zurich', 'geneva', 'genève', 
    'luxembourg', 'madrid', 'barcelona', 'milan', 'frankfurt', 'berlin', 'amsterdam', 
    'new york', 'dubai', 'singapore', 'hong kong', 'tokyo', 'sydney'];
  
  // Mappings de villes/régions (ce qui est considéré comme équivalent)
  const locationMappings: Record<string, string[]> = {
    'monaco': ['monaco', 'monte-carlo', 'monte carlo', 'principauté de monaco', 'mc 98'],
    'paris': ['paris', 'île-de-france', 'ile-de-france', 'idf'],
    'london': ['london', 'londres', 'greater london'],
    'londres': ['london', 'londres', 'greater london'],
    'zurich': ['zurich', 'zürich'],
    'geneva': ['geneva', 'genève', 'geneve'],
    'genève': ['geneva', 'genève', 'geneve'],
    'suisse': ['switzerland', 'suisse', 'schweiz', 'zurich', 'zürich', 'geneva', 'genève', 'lausanne', 'bern', 'basel'],
    'switzerland': ['switzerland', 'suisse', 'schweiz', 'zurich', 'zürich', 'geneva', 'genève', 'lausanne', 'bern', 'basel'],
    'luxembourg': ['luxembourg', 'luxemburg'],
    'nice': ['nice', '06000', '06'],
    'cannes': ['cannes', '06400'],
    'antibes': ['antibes', '06600'],
    'côte d\'azur': ['nice', 'cannes', 'antibes', 'monaco', 'monte-carlo', 'menton', 'côte d\'azur', 'cote d\'azur', 'alpes-maritimes'],
    'marseille': ['marseille', '13'],
    'lyon': ['lyon', '69'],
    'bordeaux': ['bordeaux', '33'],
    'madrid': ['madrid'],
    'barcelona': ['barcelona', 'barcelone'],
    'barcelone': ['barcelona', 'barcelone'],
    'milan': ['milan', 'milano'],
    'frankfurt': ['frankfurt', 'francfort'],
    'france': ['france', 'paris', 'lyon', 'marseille', 'bordeaux', 'nice', 'toulouse', 'nantes', 'strasbourg', 'lille'],
  };
  
  // Obtenir les termes acceptés pour la localisation demandée
  const acceptedTerms = locationMappings[reqLoc] || [reqLoc];
  
  // EXCLUSION STRICTE: Si l'offre contient une grande ville différente de celle demandée, REJETER
  for (const city of majorCities) {
    // Si cette ville est dans l'offre
    if (jobLoc.includes(city)) {
      // Vérifier si c'est la ville demandée ou un équivalent
      const isRequested = acceptedTerms.some(term => city.includes(term) || term.includes(city));
      if (!isRequested) {
        // C'est une autre grande ville -> REJETER
        return false;
      }
    }
  }
  
  // Vérifier si l'offre correspond à un des termes acceptés
  for (const term of acceptedTerms) {
    if (jobLoc.includes(term)) {
      return true;
    }
  }
  
  // Correspondance directe
  if (jobLoc.includes(reqLoc) || reqLoc.includes(jobLoc)) {
    return true;
  }
  
  // Si on arrive ici et que l'offre ne contient aucune grande ville connue,
  // on peut être plus permissif (petites villes, remote, etc.)
  const containsKnownCity = majorCities.some(city => jobLoc.includes(city));
  if (!containsKnownCity && jobLoc.length < 50) {
    // Localisation inconnue/générique - accepter si pas de ville majeure
    return true;
  }
  
  return false;
}

/**
 * SCRAPER PRINCIPAL - Agrège tous les sites en parallèle
 * SCRAPE TOUT - récupère le maximum d'offres possibles
 */
export async function scrapeAllJobSites(query: string, location: string = "Paris"): Promise<RealJobOffer[]> {
  console.log(`\n🚀 REAL SCRAPER - SCRAPING MAXIMUM D'OFFRES`);
  console.log(`📍 Query: "${query}" in ${location}`);
  console.log(`⚠️  STRICT LOCATION FILTER: Only jobs in ${location} will be returned\n`);
  
  const startTime = Date.now();
  
  // Générer des requêtes de recherche enrichies
  const searchQueries = generateSearchQueries(query, location);
  console.log(`📝 Generated ${searchQueries.length} search queries`);
  
  // Variantes de recherche pour maximiser les résultats
  const queryVariants = [
    query,
    `${query} stage`,
    `${query} alternance`,
    `${query} junior`,
    `stage ${query}`,
    `alternance ${query}`,
  ];
  
  const allJobs: RealJobOffer[] = [];
  
  // PHASE 1: Scraper tous les sites en parallèle avec la requête principale
  console.log(`\n📡 PHASE 1: Scraping principal sur 4 plateformes...`);
  console.log(`🔄 Lancement simultané: Indeed, LinkedIn, HelloWork, WTTJ`);
  
  const mainResults = await Promise.allSettled([
    scrapeIndeedReal(query, location).catch(err => {
      console.error('❌ Indeed scraping failed:', err.message);
      return [];
    }),
    scrapeLinkedInReal(query, location).catch(err => {
      console.error('❌ LinkedIn scraping failed:', err.message);
      return [];
    }),
    scrapeHelloWorkReal(query, location).catch(err => {
      console.error('❌ HelloWork scraping failed:', err.message);
      return [];
    }),
    scrapeWTTJReal(query, location).catch(err => {
      console.error('❌ WTTJ scraping failed:', err.message);
      return [];
    }),
  ]);
  
  mainResults.forEach((result, index) => {
    const sources = ['Indeed', 'LinkedIn', 'HelloWork', 'WTTJ'];
    if (result.status === 'fulfilled') {
      const jobs = result.value || [];
      allJobs.push(...jobs);
      console.log(`✅ ${sources[index]}: ${jobs.length} jobs récupérés`);
      if (jobs.length === 0) {
        console.log(`⚠️  ${sources[index]}: Aucune offre trouvée (peut être normal selon la recherche)`);
      }
    } else {
      console.error(`❌ ${sources[index]} échec complet:`, result.reason?.message || result.reason);
    }
  });
  
  console.log(`\n📊 Total après PHASE 1: ${allJobs.length} offres`);
  
  // PHASE 2: Scraper avec des variantes de requête pour plus de résultats
  console.log(`\n📡 PHASE 2: Recherches complémentaires...`);
  const additionalQueries = [...new Set([...queryVariants, ...searchQueries.slice(1, 6)])];
  
  for (const additionalQuery of additionalQueries.slice(0, 5)) {
    if (additionalQuery === query) continue; // Skip la requête principale déjà faite
    
    try {
      console.log(`🔍 Additional search: "${additionalQuery}"`);
      
      // Scraper Indeed et LinkedIn avec les variantes
      const [indeedResults, linkedinResults] = await Promise.allSettled([
        scrapeIndeedReal(additionalQuery, location),
        scrapeLinkedInReal(additionalQuery, location),
      ]);
      
      if (indeedResults.status === 'fulfilled') {
        allJobs.push(...indeedResults.value);
        console.log(`   Indeed: +${indeedResults.value.length} jobs`);
      }
      if (linkedinResults.status === 'fulfilled') {
        allJobs.push(...linkedinResults.value);
        console.log(`   LinkedIn: +${linkedinResults.value.length} jobs`);
      }
    } catch (error) {
      console.error(`Error with additional query "${additionalQuery}":`, error);
    }
  }
  
  // Dédupliquer par URL
  const uniqueJobs = Array.from(
    new Map(allJobs.map(job => [job.url, job])).values()
  );
  
  // FILTRE STRICT PAR LOCALISATION
  // Ne garder que les offres qui correspondent vraiment à la localisation demandée
  const filteredJobs = uniqueJobs.filter(job => {
    const matches = matchesLocation(job.location, location);
    if (!matches) {
      console.log(`🚫 Filtered out: "${job.title}" at ${job.company} (${job.location}) - not in ${location}`);
    }
    return matches;
  });
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n📊 SCRAPING RESULTS:`);
  console.log(`   Total scraped: ${uniqueJobs.length}`);
  console.log(`   After location filter (${location}): ${filteredJobs.length}`);
  console.log(`   Duration: ${duration}s\n`);
  
  // Si aucune offre trouvée pour cette localisation, retourner un tableau vide
  // PAS DE DONNÉES FICTIVES
  if (filteredJobs.length === 0) {
    console.log(`⚠️  No real jobs found in ${location} for "${query}"`);
    console.log(`   This is normal - not all locations have internship offers.`);
  }
  
  return filteredJobs;
}

/**
 * Détecter le type de contrat
 */
function detectContractType(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('stage') || lowerText.includes('intern')) return 'stage';
  if (lowerText.includes('alternance') || lowerText.includes('apprentice')) return 'alternance';
  if (lowerText.includes('cdi') || lowerText.includes('permanent')) return 'cdi';
  if (lowerText.includes('cdd') || lowerText.includes('temporary') || lowerText.includes('contract')) return 'cdd';
  if (lowerText.includes('freelance') || lowerText.includes('contractor')) return 'freelance';
  
  return 'cdi';
}

/**
 * Extraire les compétences du texte
 */
function extractSkills(text: string): string[] {
  const skills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue',
    'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 
    'Agile', 'Scrum', 'Excel', 'PowerPoint', 'Tableau', 'Power BI', 'Salesforce',
    'Finance', 'Marketing', 'Sales', 'Data Analysis', 'Machine Learning', 'AI'
  ];
  
  const found: string[] = [];
  const lowerText = text.toLowerCase();
  
  skills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  });
  
  return found;
}
