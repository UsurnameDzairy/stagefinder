const puppeteer = require('puppeteer');

async function setupPage(page) {
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR', 'fr', 'en-US', 'en'] });
    window.chrome = { runtime: {} };
  });
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
  });
  return page;
}

async function testScraper() {
  console.log('🚀 Test du VRAI scraper...\n');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    
    // Test LinkedIn (fonctionne bien)
    console.log('📍 Test LinkedIn...');
    let page = await browser.newPage();
    page = await setupPage(page);
    
    await page.goto('https://www.linkedin.com/jobs/search/?keywords=developer&location=Paris&f_TPR=r86400', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    const linkedinJobs = await page.evaluate(() => {
      const cards = document.querySelectorAll('.base-card, .base-search-card');
      return Array.from(cards).slice(0, 5).map(card => {
        const titleEl = card.querySelector('.base-search-card__title, h3');
        const companyEl = card.querySelector('.base-search-card__subtitle');
        const locationEl = card.querySelector('.job-search-card__location');
        const linkEl = card.querySelector('a');
        return {
          title: titleEl ? titleEl.textContent.trim() : '',
          company: companyEl ? companyEl.textContent.trim() : '',
          location: locationEl ? locationEl.textContent.trim() : '',
          url: linkEl ? linkEl.href : ''
        };
      }).filter(j => j.title && j.company);
    });
    
    console.log(`✅ LinkedIn: ${linkedinJobs.length} vraies offres trouvées`);
    linkedinJobs.forEach((job, i) => {
      console.log(`   ${i+1}. "${job.title}" @ ${job.company}`);
      console.log(`      📍 ${job.location}`);
      console.log(`      🔗 ${job.url.substring(0, 60)}...`);
    });
    
    await page.close();
    
    // Test WTTJ
    console.log('\n📍 Test Welcome to the Jungle...');
    page = await browser.newPage();
    page = await setupPage(page);
    
    await page.goto('https://www.welcometothejungle.com/fr/jobs?query=developer&refinementList%5Boffices.city%5D%5B%5D=Paris', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    await page.waitForSelector('li[data-testid="search-results-list-item-wrapper"], article', { timeout: 5000 }).catch(() => null);
    
    const wttjJobs = await page.evaluate(() => {
      const cards = document.querySelectorAll('li[data-testid="search-results-list-item-wrapper"], article[data-testid]');
      return Array.from(cards).slice(0, 5).map(card => {
        const titleEl = card.querySelector('h4, [role="heading"]');
        const companyEl = card.querySelector('span[data-testid="job-card-company-name"], a[href*="/companies/"]');
        const linkEl = card.querySelector('a[href*="/jobs/"]');
        return {
          title: titleEl ? titleEl.textContent.trim() : '',
          company: companyEl ? companyEl.textContent.trim() : '',
          url: linkEl ? linkEl.href : ''
        };
      }).filter(j => j.title);
    });
    
    console.log(`✅ WTTJ: ${wttjJobs.length} vraies offres trouvées`);
    wttjJobs.forEach((job, i) => {
      console.log(`   ${i+1}. "${job.title}" @ ${job.company}`);
    });
    
    console.log('\n✅ Test terminé - VRAIES données disponibles');
    console.log(`📊 Total: ${linkedinJobs.length + wttjJobs.length} vraies offres`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (browser) await browser.close();
  }
}

testScraper();
