/**
 * VRAI SCRAPER - Scrape réellement LinkedIn, Indeed, HelloWork, etc.
 * Utilise Puppeteer pour contourner les protections anti-bot
 */

import puppeteer from 'puppeteer';

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
}

/**
 * Configuration du navigateur Puppeteer
 */
async function launchBrowser() {
  return await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
      '--disable-blink-features=AutomationControlled',
    ],
  });
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
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Attendre que les offres se chargent
    await page.waitForSelector('.jobs-search__results-list, .job-card-container', { timeout: 10000 }).catch(() => null);
    
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
    console.error('❌ [LinkedIn] Scraping error:', error);
  } finally {
    if (browser) await browser.close();
  }
  
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
    const url = `https://fr.indeed.com/jobs?q=${searchQuery}&l=${searchLocation}&fromage=7`; // Derniers 7 jours
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Attendre les résultats
    await page.waitForSelector('.job_seen_beacon, .jobsearch-SerpJobCard, .slider_item', { timeout: 10000 }).catch(() => null);
    
    // Extraire les offres
    const jobElements = await page.$$('.job_seen_beacon, .jobsearch-SerpJobCard, .slider_item');
    
    console.log(`📊 [Indeed] Found ${jobElements.length} job cards`);
    
    for (let i = 0; i < Math.min(jobElements.length, 20); i++) {
      try {
        const element = jobElements[i];
        
        const title = await element.$eval('h2.jobTitle span, .jobTitle', el => el.textContent?.trim() || '').catch(() => '');
        const company = await element.$eval('.companyName', el => el.textContent?.trim() || '').catch(() => '');
        const location = await element.$eval('.companyLocation', el => el.textContent?.trim() || '').catch(() => '');
        const snippet = await element.$eval('.job-snippet', el => el.textContent?.trim() || '').catch(() => '');
        const jobLink = await element.$eval('h2.jobTitle a, a.jcs-JobTitle', el => el.getAttribute('href') || '').catch(() => '');
        
        if (title && company && jobLink) {
          const fullUrl = jobLink.startsWith('http') ? jobLink : `https://fr.indeed.com${jobLink}`;
          
          jobs.push({
            title,
            company,
            location: location || 'France',
            contractType: detectContractType(title + ' ' + snippet),
            description: snippet || `${title} chez ${company}`,
            url: fullUrl,
            source: 'indeed',
            postedDate: new Date(),
            skills: extractSkills(title + ' ' + snippet),
          });
        }
      } catch (err) {
        console.error(`Error parsing Indeed job ${i}:`, err);
      }
    }
    
    console.log(`✅ [Indeed] Scraped ${jobs.length} real jobs`);
  } catch (error) {
    console.error('❌ [Indeed] Scraping error:', error);
  } finally {
    if (browser) await browser.close();
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
    const url = `https://www.hellowork.com/fr-fr/emplois.html?k=${searchQuery}&l=${searchLocation}`;
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    await page.waitForSelector('.job-card, article[data-cy="job-card"], .tw-result-list-item', { timeout: 10000 }).catch(() => null);
    
    const jobElements = await page.$$('.job-card, article[data-cy="job-card"], .tw-result-list-item');
    
    console.log(`📊 [HelloWork] Found ${jobElements.length} job cards`);
    
    for (let i = 0; i < Math.min(jobElements.length, 20); i++) {
      try {
        const element = jobElements[i];
        
        const title = await element.$eval('h2, .job-title, [data-cy="job-title"]', el => el.textContent?.trim() || '').catch(() => '');
        const company = await element.$eval('.company-name, [data-cy="company-name"]', el => el.textContent?.trim() || '').catch(() => '');
        const location = await element.$eval('.job-location', el => el.textContent?.trim() || '').catch(() => '');
        const jobLink = await element.$eval('a', el => el.getAttribute('href') || '').catch(() => '');
        
        if (title && jobLink) {
          const fullUrl = jobLink.startsWith('http') ? jobLink : `https://www.hellowork.com${jobLink}`;
          
          jobs.push({
            title,
            company: company || 'Entreprise',
            location: location || 'France',
            contractType: detectContractType(title),
            description: `${title}${company ? ` chez ${company}` : ''}`,
            url: fullUrl,
            source: 'hellowork',
            postedDate: new Date(),
            skills: extractSkills(title),
          });
        }
      } catch (err) {
        console.error(`Error parsing HelloWork job ${i}:`, err);
      }
    }
    
    console.log(`✅ [HelloWork] Scraped ${jobs.length} real jobs`);
  } catch (error) {
    console.error('❌ [HelloWork] Scraping error:', error);
  } finally {
    if (browser) await browser.close();
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
    
    await page.setRequestInterception(true);
    page.on('request', (req: any) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    const searchQuery = encodeURIComponent(query);
    const url = `https://www.welcometothejungle.com/fr/jobs?query=${searchQuery}&refinementList[offices.city][]=${location}`;
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    await page.waitForSelector('li[data-testid="job-list-item"], .sc-job-card', { timeout: 10000 }).catch(() => null);
    
    const jobElements = await page.$$('li[data-testid="job-list-item"], .sc-job-card');
    
    console.log(`📊 [WTTJ] Found ${jobElements.length} job cards`);
    
    for (let i = 0; i < Math.min(jobElements.length, 20); i++) {
      try {
        const element = jobElements[i];
        
        const title = await element.$eval('h3, [data-testid="job-title"]', el => el.textContent?.trim() || '').catch(() => '');
        const company = await element.$eval('[data-testid="job-company-name"]', el => el.textContent?.trim() || '').catch(() => '');
        const location = await element.$eval('[data-testid="job-location"]', el => el.textContent?.trim() || '').catch(() => '');
        const jobLink = await element.$eval('a', el => el.getAttribute('href') || '').catch(() => '');
        
        if (title && company && jobLink) {
          const fullUrl = jobLink.startsWith('http') ? jobLink : `https://www.welcometothejungle.com${jobLink}`;
          
          jobs.push({
            title,
            company,
            location: location || 'France',
            contractType: detectContractType(title),
            description: `${title} chez ${company}`,
            url: fullUrl,
            source: 'wttj',
            postedDate: new Date(),
            skills: extractSkills(title),
          });
        }
      } catch (err) {
        console.error(`Error parsing WTTJ job ${i}:`, err);
      }
    }
    
    console.log(`✅ [WTTJ] Scraped ${jobs.length} real jobs`);
  } catch (error) {
    console.error('❌ [WTTJ] Scraping error:', error);
  } finally {
    if (browser) await browser.close();
  }
  
  return jobs;
}

/**
 * SCRAPER PRINCIPAL - Agrège tous les sites en parallèle
 */
export async function scrapeAllJobSites(query: string, location: string = "Paris"): Promise<RealJobOffer[]> {
  console.log(`\n🚀 REAL SCRAPER - Scraping ALL job sites`);
  console.log(`📍 Query: "${query}" in ${location}\n`);
  
  const startTime = Date.now();
  
  // Scraper tous les sites en parallèle
  const results = await Promise.allSettled([
    scrapeIndeedReal(query, location),
    scrapeLinkedInReal(query, location),
    scrapeHelloWorkReal(query, location),
    scrapeWTTJReal(query, location),
  ]);
  
  const allJobs: RealJobOffer[] = [];
  
  results.forEach((result, index) => {
    const sources = ['Indeed', 'LinkedIn', 'HelloWork', 'WTTJ'];
    if (result.status === 'fulfilled') {
      allJobs.push(...result.value);
      console.log(`✅ ${sources[index]}: ${result.value.length} jobs`);
    } else {
      console.error(`❌ ${sources[index]} failed:`, result.reason?.message || result.reason);
    }
  });
  
  // Dédupliquer par URL
  const uniqueJobs = Array.from(
    new Map(allJobs.map(job => [job.url, job])).values()
  );
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ TOTAL: ${uniqueJobs.length} unique REAL jobs scraped in ${duration}s\n`);
  
  return uniqueJobs;
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
