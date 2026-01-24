const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const email = 'wanis.bensalah@icloud.com';
    
    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
      }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé avec cet email');
      return;
    }

    console.log('✅ Utilisateur trouvé:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- FirstName:', user.firstName);
    console.log('- LastName:', user.lastName);
    console.log('- EmailVerified:', user.emailVerified);
    console.log('- Role:', user.role);
    console.log('- CreatedAt:', user.createdAt);
    console.log('- PasswordHash exists:', !!user.passwordHash);
    console.log('- Accounts:', user.accounts.length);

    if (user.accounts.length > 0) {
      console.log('\nComptes liés:');
      user.accounts.forEach(acc => {
        console.log('  - Provider:', acc.providerId);
        console.log('    AccountId:', acc.accountId);
        console.log('    Has password:', !!acc.password);
      });
    }

    // Tester le mot de passe si fourni
    const testPassword = process.argv[2];
    if (testPassword && user.passwordHash) {
      const isValid = await bcrypt.compare(testPassword, user.passwordHash);
      console.log('\n🔐 Test du mot de passe:', isValid ? '✅ VALIDE' : '❌ INVALIDE');
    } else if (testPassword && user.accounts.length > 0) {
      // Vérifier dans les accounts
      for (const account of user.accounts) {
        if (account.password) {
          const isValid = await bcrypt.compare(testPassword, account.password);
          console.log(`\n🔐 Test du mot de passe (account ${account.providerId}):`, isValid ? '✅ VALIDE' : '❌ INVALIDE');
        }
      }
    }

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
