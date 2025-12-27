import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runAutoScrapeForAllUsers, cleanOldJobs } from "@/lib/auto-scraper";

/**
 * Endpoint pour le scraping automatique
 * Simplifié - pas besoin de CRON_SECRET
 * Utilise uniquement le scraper Puppeteer réel
 */
export async function GET(req: NextRequest) {
  try {
    console.log("🤖 [AUTO-SCRAPE] Démarrage du scraping automatique...");
    const startTime = Date.now();

    // Exécuter le scraping automatique pour tous les utilisateurs
    await runAutoScrapeForAllUsers();

    // Nettoyer les anciennes offres (> 30 jours)
    await cleanOldJobs();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ [AUTO-SCRAPE] Terminé en ${duration}s`);

    return NextResponse.json({
      success: true,
      duration: `${duration}s`,
      message: "Auto-scraping completed successfully",
    });
  } catch (error) {
    console.error("❌ [AUTO-SCRAPE] Erreur:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Auto-scraping failed",
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint pour déclencher manuellement le scraping pour l'utilisateur connecté
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`🤖 [MANUAL] Scraping manuel pour user ${session.id}`);
    
    const { runAutoScrapeForUser } = await import("@/lib/auto-scraper");
    await runAutoScrapeForUser(session.id);

    return NextResponse.json({
      success: true,
      message: `Scraping automatique lancé ! Vous recevrez des notifications pour les nouvelles offres.`,
    });
  } catch (error) {
    console.error("❌ [MANUAL] Erreur:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
