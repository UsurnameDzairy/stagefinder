/**
 * Script de test du scraper réel
 * Lance un test pour vérifier que le scraping fonctionne
 */

const puppeteer = require('puppeteer');

async function testIndeedScraper() {
  console.log('\n🧪 Testing Indeed Scraper...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Bloquer les ressources inutiles
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    const query = 'développeur';
    const location = 'Paris';
    const url = `https://fr.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`;
    
    console.log(`📍 URL: ${url}`);
    console.log(`⏳ Loading page...`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log(`✅ Page loaded`);
    console.log(`⏳ Waiting for job cards...`);
    
    await page.waitForSelector('.job_seen_beacon, .jobsearch-SerpJobCard, .slider_item', { timeout: 10000 });
    
    console.log(`✅ Job cards found`);
    console.log(`⏳ Extracting jobs...`);
    
    const jobs = await page.evaluate(() => {
      const jobCards = document.querySelectorAll('.job_seen_beacon, .jobsearch-SerpJobCard, .slider_item');
      const results = [];
      
      jobCards.forEach((card, index) => {
        if (index >= 5) return; // Limiter à 5 pour le test
        
        const titleEl = card.querySelector('h2.jobTitle span, .jobTitle');
        const companyEl = card.querySelector('.companyName');
        const locationEl = card.querySelector('.companyLocation');
        const linkEl = card.querySelector('h2.jobTitle a, a.jcs-JobTitle');
        
        if (titleEl && companyEl && linkEl) {
          results.push({
            title: titleEl.textContent.trim(),
            company: companyEl.textContent.trim(),
            location: locationEl ? locationEl.textContent.trim() : 'N/A',
            url: linkEl.href,
          });
        }
      });
      
      return results;
    });
    
    console.log(`\n✅ SUCCESS! Found ${jobs.length} jobs:\n`);
    
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title}`);
      console.log(`   Company: ${job.company}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   URL: ${job.url.substring(0, 80)}...`);
      console.log('');
    });
    
    return jobs.length > 0;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function testLinkedInScraper() {
  console.log('\n🧪 Testing LinkedIn Scraper...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    const query = 'software engineer';
    const location = 'Paris';
    const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;
    
    console.log(`📍 URL: ${url}`);
    console.log(`⏳ Loading page...`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log(`✅ Page loaded`);
    console.log(`⏳ Waiting for job cards...`);
    
    await page.waitForSelector('.jobs-search__results-list, .job-card-container, .base-card', { timeout: 10000 });
    
    console.log(`✅ Job cards found`);
    console.log(`⏳ Extracting jobs...`);
    
    const jobs = await page.evaluate(() => {
      const jobCards = document.querySelectorAll('.job-card-container, .base-card');
      const results = [];
      
      jobCards.forEach((card, index) => {
        if (index >= 5) return;
        
        const titleEl = card.querySelector('.base-search-card__title, .job-card-list__title');
        const companyEl = card.querySelector('.base-search-card__subtitle, .job-card-container__company-name');
        const locationEl = card.querySelector('.job-search-card__location, .job-card-container__metadata-item');
        const linkEl = card.querySelector('a');
        
        if (titleEl && companyEl && linkEl) {
          results.push({
            title: titleEl.textContent.trim(),
            company: companyEl.textContent.trim(),
            location: locationEl ? locationEl.textContent.trim() : 'N/A',
            url: linkEl.href.split('?')[0],
          });
        }
      });
      
      return results;
    });
    
    console.log(`\n✅ SUCCESS! Found ${jobs.length} jobs:\n`);
    
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title}`);
      console.log(`   Company: ${job.company}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   URL: ${job.url.substring(0, 80)}...`);
      console.log('');
    });
    
    return jobs.length > 0;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Lancer les tests
(async () => {
  console.log('🚀 Starting scraper tests...\n');
  console.log('=' .repeat(60));
  
  const indeedSuccess = await testIndeedScraper();
  console.log('=' .repeat(60));
  
  const linkedInSuccess = await testLinkedInScraper();
  console.log('=' .repeat(60));
  
  console.log('\n📊 Test Results:');
  console.log(`   Indeed: ${indeedSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   LinkedIn: ${linkedInSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (indeedSuccess || linkedInSuccess) {
    console.log('\n🎉 At least one scraper is working! Ready to integrate.\n');
  } else {
    console.log('\n⚠️  All scrapers failed. May need adjustments.\n');
  }
})();
