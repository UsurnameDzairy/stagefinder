const { scrapeAllJobSites } = require('./src/lib/scrapers/real-scraper.ts');

async function testFinanceScraper() {
  console.log('🔍 Test scraping Finance à Paris...\n');
  
  try {
    const jobs = await scrapeAllJobSites('Finance', 'Paris');
    
    console.log(`\n✅ ${jobs.length} offres Finance trouvées:\n`);
    
    jobs.slice(0, 10).forEach((job, i) => {
      console.log(`${i + 1}. ${job.title}`);
      console.log(`   📍 ${job.company} - ${job.location}`);
      console.log(`   📝 ${job.contractType}`);
      console.log(`   🔗 ${job.url.substring(0, 60)}...`);
      console.log('');
    });
    
    if (jobs.length > 10) {
      console.log(`... et ${jobs.length - 10} autres offres`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testFinanceScraper();
