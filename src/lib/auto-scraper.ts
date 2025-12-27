/**
 * Système de scraping automatique basé sur le profil utilisateur
 * Scrape automatiquement les offres correspondant au profil et envoie des notifications
 */

import { prisma } from "@/lib/prisma";
import { scrapeAllJobSites } from "@/lib/scrapers/real-scraper";
import { createSystemNotification } from "@/lib/notifications";

interface UserProfile {
  userId: string;
  domains?: string | null;
  contractTypes?: string | null;
  preferredCities?: string | null;
  skills: Array<{ name: string }>;
}

/**
 * Scrape automatiquement pour tous les utilisateurs actifs
 */
export async function runAutoScrapeForAllUsers() {
  console.log("🤖 [AUTO-SCRAPER] Démarrage du scraping automatique...");
  
  try {
    // Récupérer tous les utilisateurs avec un profil actif
    const users = await prisma.user.findMany({
      where: {
        profile: {
          isNot: null,
        },
      },
      include: {
        profile: true,
        skills: {
          select: { name: true },
        },
      },
    });

    console.log(`📊 [AUTO-SCRAPER] ${users.length} utilisateurs à traiter`);

    for (const user of users) {
      try {
        await runAutoScrapeForUser(user.id);
      } catch (error) {
        console.error(`❌ [AUTO-SCRAPER] Erreur pour user ${user.id}:`, error);
      }
    }

    console.log("✅ [AUTO-SCRAPER] Scraping automatique terminé");
  } catch (error) {
    console.error("❌ [AUTO-SCRAPER] Erreur globale:", error);
  }
}

/**
 * Scrape automatiquement pour un utilisateur spécifique
 */
export async function runAutoScrapeForUser(userId: string) {
  console.log(`\n🔍 [AUTO-SCRAPER] Traitement utilisateur ${userId}`);
  
  try {
    // Récupérer le profil utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        skills: {
          select: { name: true },
        },
      },
    });

    if (!user || !user.profile) {
      console.log(`⚠️ [AUTO-SCRAPER] Pas de profil pour ${userId}`);
      return;
    }

    // Construire les requêtes de recherche basées sur le profil
    const searchQueries = buildSearchQueries(user.profile, user.skills);
    
    if (searchQueries.length === 0) {
      console.log(`⚠️ [AUTO-SCRAPER] Pas de requêtes pour ${userId}`);
      return;
    }

    console.log(`📋 [AUTO-SCRAPER] ${searchQueries.length} requêtes à exécuter`);

    let totalNewJobs = 0;

    // Exécuter chaque requête
    for (const query of searchQueries) {
      try {
        console.log(`   🔎 Recherche: "${query.search}" à ${query.location}`);
        
        // Scraper les offres réelles
        const jobs = await scrapeAllJobSites(query.search, query.location);
        
        if (jobs.length === 0) {
          console.log(`   ⚠️ Aucune offre trouvée`);
          continue;
        }

        console.log(`   ✅ ${jobs.length} offres trouvées`);

        // Sauvegarder et notifier les nouvelles offres
        const newJobs = await saveAndNotifyNewJobs(userId, jobs, query);
        totalNewJobs += newJobs;
        
      } catch (error) {
        console.error(`   ❌ Erreur recherche "${query.search}":`, error);
      }
    }

    console.log(`✅ [AUTO-SCRAPER] ${totalNewJobs} nouvelles offres pour ${userId}`);
    
  } catch (error) {
    console.error(`❌ [AUTO-SCRAPER] Erreur user ${userId}:`, error);
  }
}

/**
 * Construit les requêtes de recherche basées sur le profil
 */
function buildSearchQueries(
  profile: any,
  skills: Array<{ name: string }>
): Array<{ search: string; location: string; domain: string }> {
  const queries: Array<{ search: string; location: string; domain: string }> = [];
  
  // Domaines d'intérêt
  const domains = profile.domains ? profile.domains.split(',').map((d: string) => d.trim()) : [];
  
  // Villes préférées
  const cities = profile.preferredCities 
    ? profile.preferredCities.split(',').map((c: string) => c.trim())
    : ['Paris'];
  
  // Types de contrat
  const contractTypes = profile.contractTypes
    ? profile.contractTypes.split(',').map((c: string) => c.trim())
    : ['CDI', 'CDD', 'Stage', 'Alternance'];

  // Générer des requêtes pour chaque combinaison domaine + ville + type de contrat
  if (domains.length > 0) {
    for (const domain of domains) {
      for (const city of cities) {
        for (const contractType of contractTypes) {
          // Requête principale: domaine + type de contrat
          queries.push({
            search: `${domain} ${contractType}`,
            location: city,
            domain: domain,
          });
        }
      }
    }
  }

  // Ajouter des requêtes basées sur les compétences principales
  const topSkills = skills.slice(0, 3); // Top 3 compétences
  for (const skill of topSkills) {
    for (const city of cities) {
      queries.push({
        search: skill.name,
        location: city,
        domain: 'skill',
      });
    }
  }

  // Limiter à 10 requêtes max pour ne pas surcharger
  return queries.slice(0, 10);
}

/**
 * Sauvegarde les nouvelles offres et envoie des notifications
 */
async function saveAndNotifyNewJobs(
  userId: string,
  jobs: any[],
  query: { search: string; location: string; domain: string }
): Promise<number> {
  let newJobsCount = 0;

  for (const job of jobs) {
    try {
      // Vérifier si l'offre existe déjà
      const existing = await prisma.jobOffer.findFirst({
        where: {
          sourceUrl: job.url,
        },
      });

      if (existing) {
        // Offre déjà en base, skip
        continue;
      }

      // Nouvelle offre - sauvegarder
      const savedJob = await prisma.jobOffer.create({
        data: {
          sourceProvider: job.source,
          externalId: `${job.source}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: job.title,
          companyName: job.company,
          location: job.location,
          contractType: job.contractType,
          description: job.description,
          skills: JSON.stringify(job.skills || []),
          sourceUrl: job.url,
          publishedAt: job.postedDate,
        },
      });

      newJobsCount++;

      // Créer une notification pour l'utilisateur
      await createSystemNotification(
        userId,
        `Nouvelle offre ${job.contractType}: ${job.title}`,
        `${job.company} recrute à ${job.location}. Domaine: ${query.domain}`,
        {
          jobId: savedJob.id,
          domain: query.domain,
          contractType: job.contractType,
          link: `/offres?highlight=${savedJob.id}`,
        }
      );

      console.log(`   📬 Notification envoyée: ${job.title} @ ${job.company}`);
      
    } catch (error) {
      console.error(`   ❌ Erreur sauvegarde job:`, error);
    }
  }

  return newJobsCount;
}

/**
 * Nettoie les anciennes offres (> 30 jours)
 */
export async function cleanOldJobs() {
  console.log("🧹 [AUTO-SCRAPER] Nettoyage des anciennes offres...");
  
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deleted = await prisma.jobOffer.deleteMany({
      where: {
        publishedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    console.log(`✅ [AUTO-SCRAPER] ${deleted.count} anciennes offres supprimées`);
  } catch (error) {
    console.error("❌ [AUTO-SCRAPER] Erreur nettoyage:", error);
  }
}
