const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteUser() {
  try {
    const email = 'wanis.bensalah@icloud.com';
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    // Supprimer l'utilisateur (cascade supprimera aussi les accounts, sessions, etc.)
    await prisma.user.delete({
      where: { email }
    });

    console.log('✅ Utilisateur supprimé avec succès');
    console.log('Vous pouvez maintenant créer un nouveau compte via l\'interface d\'inscription');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();
