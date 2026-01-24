import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runSmartScraper, getSmartRecommendations } from "@/lib/ai/smart-scraper";

/**
 * POST /api/smart-scraper
 * Lance le Smart Scraper IA pour l'utilisateur connecté
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`🤖 Smart Scraper lancé pour user ${session.id}`);
    
    // Lancer le scraping intelligent
    const result = await runSmartScraper(session.id);
    
    return NextResponse.json({
      success: true,
      data: {
        totalFound: result.totalFound,
        topMatches: result.topMatches.slice(0, 20).map(offer => ({
          title: offer.title,
          company: offer.company,
          location: offer.location,
          contractType: offer.contractType,
          description: offer.description?.substring(0, 200) + '...',
          url: offer.url,
          source: offer.source,
          matchScore: offer.matchScore,
          matchReasons: offer.matchReasons,
          missingSkills: offer.missingSkills,
        })),
        searchQueries: result.searchQueries,
        recommendations: result.recommendations,
        executionTime: result.executionTime,
      },
    });
  } catch (error) {
    console.error("Smart Scraper error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Smart scraping failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/smart-scraper
 * Récupère les recommandations personnalisées sans relancer le scraping
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer les offres déjà sauvegardées avec leur score
    const { prisma } = await import("@/lib/prisma");
    
    const savedOffers = await prisma.savedOffer.findMany({
      where: { userId: session.id },
      include: {
        offer: true,
      },
      orderBy: { matchScore: 'desc' },
      take: 50,
    });

    const offers = savedOffers.map(so => ({
      id: so.offer.id,
      title: so.offer.title,
      company: so.offer.companyName,
      location: so.offer.location,
      contractType: so.offer.contractType,
      description: so.offer.description?.substring(0, 200) + '...',
      url: so.offer.sourceUrl,
      source: so.offer.sourceProvider,
      matchScore: so.matchScore || 0,
      matchData: so.matchData ? JSON.parse(so.matchData) : null,
      savedAt: so.createdAt,
    }));

    // Calculer les stats
    const avgScore = offers.reduce((sum, o) => sum + o.matchScore, 0) / Math.max(offers.length, 1);
    
    return NextResponse.json({
      success: true,
      data: {
        offers,
        stats: {
          totalSaved: offers.length,
          avgMatchScore: Math.round(avgScore),
        },
      },
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}
