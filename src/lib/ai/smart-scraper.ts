/**
 * IA SMART SCRAPER - Système intelligent de scraping personnalisé
 * 
 * Cette IA:
 * 1. Analyse le profil de l'utilisateur (compétences, expériences, préférences)
 * 2. Génère des requêtes de recherche optimisées
 * 3. Scrape les offres depuis plusieurs sources
 * 4. Score et trie les offres selon la compatibilité avec le profil
 * 5. Envoie les meilleures offres à l'utilisateur
 */

import { prisma } from "@/lib/prisma";
import { ultraScrape } from "@/lib/scrapers/ultra-scraper";

// Types
interface UserProfile {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  skills: string[];
  domains: string[];
  preferredCities: string[];
  educationLevel?: string | null;
  schoolName?: string | null;
  languages: string[];
  contractTypes: string[];
  experience?: string | null;
}

interface ScoredJobOffer {
  title: string;
  company: string;
  location: string;
  contractType: string;
  description: string;
  url: string;
  source: string;
  postedDate: Date;
  skills: string[];
  matchScore: number;
  matchReasons: string[];
  missingSkills: string[];
}

interface SmartScraperResult {
  totalFound: number;
  topMatches: ScoredJobOffer[];
  searchQueries: string[];
  executionTime: number;
  recommendations: string[];
}

/**
 * Récupérer le profil complet de l'utilisateur
 */
async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      skills: {
        select: { name: true, category: true },
      },
      resumes: {
        where: { isActive: true },
        select: { skills: true, experience: true, parsedData: true },
      },
    },
  });

  if (!user) return null;

  // Extraire les compétences
  const skills = user.skills.map(s => s.name);
  
  // Ajouter les compétences du CV si disponibles
  if (user.resumes[0]?.skills) {
    const cvSkills = user.resumes[0].skills.split(',').map(s => s.trim());
    skills.push(...cvSkills);
  }

  // Extraire les domaines
  const domains = user.profile?.domains?.split(',').map(d => d.trim()) || [];
  
  // Extraire les villes préférées
  const preferredCities = user.profile?.preferredCities?.split(',').map(c => c.trim()) || ['Paris'];
  
  // Extraire les langues
  const languages = user.profile?.languages?.split(',').map(l => l.trim()) || [];
  
  // Extraire les types de contrat
  const contractTypes = user.profile?.contractTypes?.split(',').map(c => c.trim()) || ['stage', 'alternance'];

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    skills: [...new Set(skills)], // Dédupliquer
    domains,
    preferredCities,
    educationLevel: user.profile?.educationLevel,
    schoolName: user.profile?.schoolName,
    languages,
    contractTypes,
    experience: user.resumes[0]?.experience,
  };
}

/**
 * Générer des requêtes de recherche intelligentes basées sur le profil
 */
function generateSmartQueries(profile: UserProfile): string[] {
  const queries: string[] = [];
  
  // Requêtes basées sur les domaines
  for (const domain of profile.domains.slice(0, 3)) {
    queries.push(domain);
    
    // Combiner avec le type de contrat
    for (const contractType of profile.contractTypes.slice(0, 2)) {
      queries.push(`${domain} ${contractType}`);
    }
  }
  
  // Requêtes basées sur les compétences principales
  const topSkills = profile.skills.slice(0, 5);
  for (const skill of topSkills) {
    queries.push(skill);
  }
  
  // Requêtes combinées (domaine + compétence)
  if (profile.domains.length > 0 && topSkills.length > 0) {
    queries.push(`${profile.domains[0]} ${topSkills[0]}`);
  }
  
  // Requête basée sur l'école si prestigieuse
  const prestigiousSchools = ['HEC', 'ESSEC', 'ESCP', 'Polytechnique', 'Sciences Po', 'Dauphine'];
  if (profile.schoolName && prestigiousSchools.some(s => profile.schoolName?.includes(s))) {
    queries.push(`graduate program ${profile.domains[0] || 'finance'}`);
  }
  
  // Dédupliquer et limiter
  return [...new Set(queries)].slice(0, 8);
}

/**
 * Calculer le score de compatibilité entre une offre et le profil
 */
function calculateMatchScore(offer: any, profile: UserProfile): { score: number; reasons: string[]; missingSkills: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const missingSkills: string[] = [];
  
  const offerText = `${offer.title} ${offer.description} ${offer.company}`.toLowerCase();
  const offerSkills = offer.skills || [];
  
  // 1. Correspondance des compétences (max 40 points)
  let skillMatches = 0;
  for (const skill of profile.skills) {
    if (offerText.includes(skill.toLowerCase()) || offerSkills.some((s: string) => s.toLowerCase() === skill.toLowerCase())) {
      skillMatches++;
    }
  }
  const skillScore = Math.min(40, (skillMatches / Math.max(profile.skills.length, 1)) * 40);
  score += skillScore;
  if (skillMatches > 0) {
    reasons.push(`${skillMatches} compétences matchées`);
  }
  
  // Identifier les compétences manquantes
  for (const offerSkill of offerSkills) {
    if (!profile.skills.some(s => s.toLowerCase() === offerSkill.toLowerCase())) {
      missingSkills.push(offerSkill);
    }
  }
  
  // 2. Correspondance du domaine (max 20 points)
  for (const domain of profile.domains) {
    if (offerText.includes(domain.toLowerCase())) {
      score += 20;
      reasons.push(`Domaine "${domain}" correspondant`);
      break;
    }
  }
  
  // 3. Correspondance de la localisation (max 15 points)
  for (const city of profile.preferredCities) {
    if (offer.location?.toLowerCase().includes(city.toLowerCase())) {
      score += 15;
      reasons.push(`Localisation "${city}" correspondante`);
      break;
    }
  }
  
  // 4. Type de contrat (max 15 points)
  for (const contractType of profile.contractTypes) {
    if (offer.contractType?.toLowerCase().includes(contractType.toLowerCase())) {
      score += 15;
      reasons.push(`Type de contrat "${contractType}" correspondant`);
      break;
    }
  }
  
  // 5. Bonus pour entreprises prestigieuses (max 10 points)
  const prestigiousCompanies = [
    'Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'McKinsey', 'BCG', 'Bain',
    'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix',
    'BNP Paribas', 'Société Générale', 'Rothschild', 'Lazard',
    'LVMH', 'L\'Oréal', 'Total', 'Airbus', 'Sanofi'
  ];
  
  for (const company of prestigiousCompanies) {
    if (offer.company?.toLowerCase().includes(company.toLowerCase())) {
      score += 10;
      reasons.push(`Entreprise prestigieuse: ${company}`);
      break;
    }
  }
  
  return { score: Math.min(100, Math.round(score)), reasons, missingSkills: missingSkills.slice(0, 5) };
}

/**
 * Générer des recommandations personnalisées
 */
function generateRecommendations(profile: UserProfile, offers: ScoredJobOffer[]): string[] {
  const recommendations: string[] = [];
  
  // Analyser les compétences manquantes les plus fréquentes
  const missingSkillsCount: Record<string, number> = {};
  for (const offer of offers) {
    for (const skill of offer.missingSkills) {
      missingSkillsCount[skill] = (missingSkillsCount[skill] || 0) + 1;
    }
  }
  
  const topMissingSkills = Object.entries(missingSkillsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([skill]) => skill);
  
  if (topMissingSkills.length > 0) {
    recommendations.push(`💡 Compétences à développer: ${topMissingSkills.join(', ')}`);
  }
  
  // Recommandations basées sur le profil
  if (profile.skills.length < 5) {
    recommendations.push(`📝 Ajoutez plus de compétences à votre profil pour améliorer le matching`);
  }
  
  if (profile.preferredCities.length === 0) {
    recommendations.push(`📍 Définissez vos villes préférées pour des résultats plus pertinents`);
  }
  
  // Recommandations basées sur les résultats
  const avgScore = offers.reduce((sum, o) => sum + o.matchScore, 0) / Math.max(offers.length, 1);
  if (avgScore < 50) {
    recommendations.push(`🎯 Score moyen faible (${Math.round(avgScore)}%) - Élargissez vos critères de recherche`);
  } else if (avgScore > 70) {
    recommendations.push(`✅ Excellent matching (${Math.round(avgScore)}%) - Postulez rapidement aux top offres !`);
  }
  
  return recommendations;
}

/**
 * FONCTION PRINCIPALE - IA Smart Scraper
 */
export async function runSmartScraper(userId: string): Promise<SmartScraperResult> {
  const startTime = Date.now();
  
  console.log(`\n🤖 ============================================`);
  console.log(`🤖 SMART SCRAPER IA - Démarrage pour user ${userId}`);
  console.log(`🤖 ============================================\n`);
  
  // 1. Récupérer le profil utilisateur
  console.log(`📊 [STEP 1] Analyse du profil utilisateur...`);
  const profile = await getUserProfile(userId);
  
  if (!profile) {
    throw new Error("Profil utilisateur non trouvé");
  }
  
  console.log(`   ✅ Profil chargé:`);
  console.log(`      - ${profile.skills.length} compétences`);
  console.log(`      - ${profile.domains.length} domaines`);
  console.log(`      - ${profile.preferredCities.length} villes préférées`);
  console.log(`      - Types de contrat: ${profile.contractTypes.join(', ')}`);
  
  // 2. Générer les requêtes de recherche intelligentes
  console.log(`\n🧠 [STEP 2] Génération des requêtes intelligentes...`);
  const searchQueries = generateSmartQueries(profile);
  console.log(`   ✅ ${searchQueries.length} requêtes générées:`);
  searchQueries.forEach((q, i) => console.log(`      ${i + 1}. "${q}"`));
  
  // 3. Scraper les offres avec l'Ultra Scraper
  console.log(`\n🔍 [STEP 3] Scraping des offres avec Ultra Scraper...`);
  const allOffers: any[] = [];
  
  // Utiliser l'Ultra Scraper pour chaque combinaison requête/ville
  for (const query of searchQueries.slice(0, 3)) { // Top 3 requêtes
    for (const city of profile.preferredCities.slice(0, 2)) { // Top 2 villes
      try {
        const results = await ultraScrape(query, city);
        if (results.length > 0) {
          allOffers.push(...results);
          console.log(`   ✅ "${query}" à ${city}: ${results.length} offres`);
        }
      } catch (error) {
        console.error(`   ❌ Erreur "${query}" à ${city}: ${error}`);
      }
    }
  }
  
  // 4. Dédupliquer les offres
  console.log(`\n🔄 [STEP 4] Déduplication...`);
  const uniqueOffers = Array.from(
    new Map(allOffers.map(o => [`${o.title}-${o.company}`, o])).values()
  );
  console.log(`   ✅ ${uniqueOffers.length} offres uniques (sur ${allOffers.length} trouvées)`);
  
  // 5. Scorer et trier les offres
  console.log(`\n📈 [STEP 5] Scoring et tri des offres...`);
  const scoredOffers: ScoredJobOffer[] = uniqueOffers.map(offer => {
    const { score, reasons, missingSkills } = calculateMatchScore(offer, profile);
    return {
      ...offer,
      matchScore: score,
      matchReasons: reasons,
      missingSkills,
    };
  });
  
  // Trier par score décroissant
  scoredOffers.sort((a, b) => b.matchScore - a.matchScore);
  
  const topMatches = scoredOffers.slice(0, 20); // Top 20
  console.log(`   ✅ Top 5 offres:`);
  topMatches.slice(0, 5).forEach((o, i) => {
    console.log(`      ${i + 1}. [${o.matchScore}%] ${o.title} @ ${o.company}`);
  });
  
  // 6. Générer les recommandations
  console.log(`\n💡 [STEP 6] Génération des recommandations...`);
  const recommendations = generateRecommendations(profile, scoredOffers);
  recommendations.forEach(r => console.log(`   ${r}`));
  
  // 7. Sauvegarder les meilleures offres dans la base
  console.log(`\n💾 [STEP 7] Sauvegarde des offres...`);
  let savedCount = 0;
  
  for (const offer of topMatches) {
    try {
      const saved = await prisma.jobOffer.upsert({
        where: {
          sourceProvider_externalId: {
            sourceProvider: offer.source,
            externalId: `smart-${offer.source}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          },
        },
        create: {
          sourceProvider: offer.source,
          externalId: `smart-${offer.source}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: offer.title,
          companyName: offer.company,
          location: offer.location,
          contractType: offer.contractType,
          description: offer.description,
          skills: JSON.stringify(offer.skills || []),
          sourceUrl: offer.url,
          publishedAt: offer.postedDate,
        },
        update: {},
      });
      
      // Sauvegarder comme offre recommandée pour l'utilisateur
      await prisma.savedOffer.upsert({
        where: {
          userId_offerId: {
            userId: profile.id,
            offerId: saved.id,
          },
        },
        create: {
          userId: profile.id,
          offerId: saved.id,
          matchScore: offer.matchScore,
          matchData: JSON.stringify({
            reasons: offer.matchReasons,
            missingSkills: offer.missingSkills,
          }),
        },
        update: {
          matchScore: offer.matchScore,
          matchData: JSON.stringify({
            reasons: offer.matchReasons,
            missingSkills: offer.missingSkills,
          }),
        },
      });
      
      savedCount++;
    } catch (error) {
      console.error(`   ❌ Erreur sauvegarde: ${error}`);
    }
  }
  
  console.log(`   ✅ ${savedCount} offres sauvegardées`);
  
  const executionTime = (Date.now() - startTime) / 1000;
  
  console.log(`\n🤖 ============================================`);
  console.log(`🤖 SMART SCRAPER IA - Terminé en ${executionTime.toFixed(2)}s`);
  console.log(`🤖 ============================================\n`);
  
  return {
    totalFound: uniqueOffers.length,
    topMatches,
    searchQueries,
    executionTime,
    recommendations,
  };
}

/**
 * API pour lancer le Smart Scraper depuis le frontend
 */
export async function getSmartRecommendations(userId: string): Promise<{
  offers: ScoredJobOffer[];
  recommendations: string[];
  stats: {
    totalFound: number;
    avgMatchScore: number;
    topDomains: string[];
  };
}> {
  const result = await runSmartScraper(userId);
  
  const avgMatchScore = result.topMatches.reduce((sum, o) => sum + o.matchScore, 0) / Math.max(result.topMatches.length, 1);
  
  // Identifier les domaines les plus représentés
  const domainCount: Record<string, number> = {};
  for (const offer of result.topMatches) {
    const domain = offer.title.split(' ')[0]; // Simplification
    domainCount[domain] = (domainCount[domain] || 0) + 1;
  }
  const topDomains = Object.entries(domainCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([domain]) => domain);
  
  return {
    offers: result.topMatches,
    recommendations: result.recommendations,
    stats: {
      totalFound: result.totalFound,
      avgMatchScore: Math.round(avgMatchScore),
      topDomains,
    },
  };
}

export type { UserProfile, ScoredJobOffer, SmartScraperResult };
