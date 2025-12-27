const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanFakeData() {
  console.log('🧹 Nettoyage des fausses données...');
  
  try {
    // Compter avant
    const beforeCount = await prisma.jobOffer.count();
    console.log(`📊 Offres avant nettoyage: ${beforeCount}`);
    
    // Supprimer TOUTES les offres pour repartir de zéro avec des vraies données
    const deleted = await prisma.jobOffer.deleteMany({});
    
    console.log(`🗑️ Supprimé: ${deleted.count} offres`);
    
    // Compter après
    const afterCount = await prisma.jobOffer.count();
    console.log(`📊 Offres après nettoyage: ${afterCount}`);
    
    console.log('✅ Base de données nettoyée - prête pour les vraies données');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanFakeData();
