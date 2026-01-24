const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'wanis.bensalah@icloud.com';
    const newPassword = process.argv[2];

    if (!newPassword) {
      console.log('❌ Usage: node reset-password.js <nouveau_mot_de_passe>');
      return;
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Trouver le compte credential
    const credentialAccount = user.accounts.find(acc => acc.providerId === 'credential');

    if (credentialAccount) {
      // Mettre à jour le mot de passe dans Account
      await prisma.account.update({
        where: { id: credentialAccount.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Mot de passe mis à jour dans Account');
    } else {
      // Créer un nouveau compte credential
      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: 'credential',
          password: hashedPassword,
        }
      });
      console.log('✅ Compte credential créé avec le nouveau mot de passe');
    }

    console.log('\n✅ Mot de passe réinitialisé avec succès!');
    console.log('Vous pouvez maintenant vous connecter avec:');
    console.log('Email:', email);
    console.log('Mot de passe:', newPassword);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
