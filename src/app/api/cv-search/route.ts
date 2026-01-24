/**
 * API de recherche intelligente basée sur le CV
 * Recherche des offres par proximité géographique et matching de domaine
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  extractUserBaseCity,
  generateSearchQueries,
  scoreOffer,
  getBestOffers,
  extractMainDomain,
  type JobOffer,
  type ScoredOffer,
} from "@/lib/cv-matching";
import { scrapeAllJobSites } from "@/lib/scrapers/real-scraper";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { contractType = "stage", maxResults = 30 } = body;

    // Récupérer le profil utilisateur avec ses compétences et son CV
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        skills: true,
        resumes: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extraire les informations du CV
    const activeResume = user.resumes[0];
    const cvText = activeResume?.extractedText || "";
    
    // Récupérer les compétences
    const userSkills = user.skills.map(s => s.name);
    
    // Récupérer les domaines depuis le profil ou les extraire du CV
    let userDomains: string[] = [];
    if (user.profile?.domains) {
      userDomains = user.profile.domains.split(",").map(d => d.trim());
    }
    if (userDomains.length === 0 && cvText) {
      const mainDomain = extractMainDomain(cvText);
      userDomains = [mainDomain];
    }
    if (userDomains.length === 0) {
      userDomains = ["Finance"]; // Défaut
    }

    // Déterminer la ville de base de l'utilisateur
    const cvCities = user.profile?.preferredCities?.split(",").map(c => c.trim()) || [];
    const userBaseCity = extractUserBaseCity(cvText, cvCities);

    console.log("🔍 CV Search started");
    console.log("User base city:", userBaseCity);
    console.log("User domains:", userDomains);
    console.log("User skills:", userSkills.slice(0, 10));

    // Générer les requêtes de recherche par zone géographique
    const searchQueries = generateSearchQueries(
      userDomains,
      userSkills,
      userBaseCity,
      contractType
    );

    console.log("Generated queries:", searchQueries.length);

    // Exécuter les recherches par zone (limiter à 5 requêtes pour la performance)
    const allOffers: JobOffer[] = [];
    const queriesLimit = Math.min(searchQueries.length, 5);

    for (let i = 0; i < queriesLimit; i++) {
      const query = searchQueries[i];
      console.log(`Searching: "${query.keywords}" in ${query.location}`);
      
      try {
        const results = await scrapeAllJobSites(query.keywords, query.location);

        // Convertir les résultats en JobOffer
        for (const result of results) {
          allOffers.push({
            id: `${result.title}-${result.company}-${query.location}`.replace(/\s/g, '-'),
            title: result.title,
            company: result.company,
            location: result.location || query.location,
            description: result.description,
            contractType: result.contractType || contractType,
            url: result.url,
            source: result.source,
          });
        }
      } catch (error) {
        console.error(`Search error for ${query.location}:`, error);
      }
    }

    console.log(`Total offers found: ${allOffers.length}`);

    // Dédupliquer les offres
    const uniqueOffers = Array.from(
      new Map(allOffers.map(o => [`${o.title}-${o.company}`, o])).values()
    );

    // Scorer et trier les offres
    const scoredOffers: ScoredOffer[] = uniqueOffers.map(offer =>
      scoreOffer(offer, userDomains, userSkills, userBaseCity)
    );

    // Obtenir les meilleures offres triées par proximité puis score
    const bestOffers = getBestOffers(scoredOffers, maxResults);

    // Grouper par zone pour l'affichage
    const offersByZone: Record<string, ScoredOffer[]> = {
      "Proximité immédiate": [],
      "Région proche": [],
      "National": [],
      "Europe": [],
      "International": [],
    };

    for (const offer of bestOffers) {
      if (offersByZone[offer.zone]) {
        offersByZone[offer.zone].push(offer);
      }
    }

    return NextResponse.json({
      success: true,
      userProfile: {
        baseCity: userBaseCity,
        domains: userDomains,
        skillsCount: userSkills.length,
      },
      totalOffers: bestOffers.length,
      offersByZone,
      offers: bestOffers,
    });

  } catch (error) {
    console.error("CV Search error:", error);
    return NextResponse.json(
      { error: "Search failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Retourner les zones géographiques disponibles
  return NextResponse.json({
    zones: [
      { name: "Proximité immédiate", description: "< 100 km", priority: 1 },
      { name: "Région proche", description: "100-500 km", priority: 2 },
      { name: "National", description: "500-1000 km", priority: 3 },
      { name: "Europe", description: "1000-2000 km", priority: 4 },
      { name: "International", description: "> 2000 km", priority: 5 },
    ],
    domains: [
      "Finance",
      "Investment Banking",
      "Private Equity",
      "Hedge Fund",
      "Asset Management",
      "Trading",
      "Risk Management",
      "Quantitative Finance",
      "Consulting",
      "Technology",
      "Data Science",
      "Marketing",
    ],
  });
}
