// Test individuel de chaque scraper
const { 
  scrapeLinkedInReal, 
  scrapeIndeedReal, 
  scrapeHelloWorkReal, 
  scrapeWTTJReal 
} = require('./src/lib/scrapers/real-scraper.ts');

async function testAllScrapers() {
  const query = 'Finance';
  const location = 'Monaco';
  
  console.log('🧪 TEST INDIVIDUEL DE CHAQUE SCRAPER\n');
  console.log(`📍 Recherche: "${query}" à "${location}"\n`);
  console.log('='.repeat(50));
  
  // Test LinkedIn
  console.log('\n🔵 TEST LINKEDIN...');
  try {
    const linkedinJobs = await scrapeLinkedInReal(query, location);
    console.log(`✅ LinkedIn: ${linkedinJobs.length} offres trouvées`);
    if (linkedinJobs.length > 0) {
      console.log(`   Exemple: "${linkedinJobs[0].title}" @ ${linkedinJobs[0].company}`);
    }
  } catch (e) {
    console.log(`❌ LinkedIn ERREUR: ${e.message}`);
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Test Indeed
  console.log('\n🟠 TEST INDEED...');
  try {
    const indeedJobs = await scrapeIndeedReal(query, location);
    console.log(`✅ Indeed: ${indeedJobs.length} offres trouvées`);
    if (indeedJobs.length > 0) {
      console.log(`   Exemple: "${indeedJobs[0].title}" @ ${indeedJobs[0].company}`);
    }
  } catch (e) {
    console.log(`❌ Indeed ERREUR: ${e.message}`);
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Test HelloWork
  console.log('\n🟢 TEST HELLOWORK...');
  try {
    const helloworkJobs = await scrapeHelloWorkReal(query, location);
    console.log(`✅ HelloWork: ${helloworkJobs.length} offres trouvées`);
    if (helloworkJobs.length > 0) {
      console.log(`   Exemple: "${helloworkJobs[0].title}" @ ${helloworkJobs[0].company}`);
    }
  } catch (e) {
    console.log(`❌ HelloWork ERREUR: ${e.message}`);
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Test WTTJ
  console.log('\n🟣 TEST WTTJ (Welcome to the Jungle)...');
  try {
    const wttjJobs = await scrapeWTTJReal(query, location);
    console.log(`✅ WTTJ: ${wttjJobs.length} offres trouvées`);
    if (wttjJobs.length > 0) {
      console.log(`   Exemple: "${wttjJobs[0].title}" @ ${wttjJobs[0].company}`);
    }
  } catch (e) {
    console.log(`❌ WTTJ ERREUR: ${e.message}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 RÉSUMÉ DES TESTS TERMINÉ');
}

testAllScrapers();
