const { scrapeAllJobSites } = require('./src/lib/scrapers/real-scraper.ts');

async function testFinanceSearch() {
  console.log('🔍 Test recherche Finance à Paris...\n');
  
  try {
    const results = await scrapeAllJobSites('Finance', 'paris');
    
    console.log(`\n📊 Résultats:`);
    console.log(`   Total: ${results.length} offres`);
    
    if (results.length > 0) {
      console.log('\n✅ Premières offres trouvées:');
      results.slice(0, 5).forEach((job, i) => {
        console.log(`   ${i + 1}. "${job.title}" @ ${job.company}`);
        console.log(`      📍 ${job.location}`);
        console.log(`      🏢 Source: ${job.source}`);
      });
    } else {
      console.log('\n❌ Aucune offre trouvée');
      console.log('   Cela peut être normal si:');
      console.log('   - Les sites bloquent le scraping');
      console.log('   - Chromium n\'est pas installé');
      console.log('   - Les sélecteurs ont changé');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testFinanceSearch();
