import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { scrapeAllJobSites } from "@/lib/scrapers/real-scraper";
import { checkJobAlertsForUser } from "@/lib/notifications";

const searchSchema = z.object({
  query: z.string().min(1),
  location: z.string().optional(),
  providers: z.array(z.string()).default(["indeed", "wttj", "hellowork"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { query, location, providers } = searchSchema.parse(body);

    const searchJob = await prisma.searchJob.create({
      data: {
        userId: session.id,
        query,
        location: location || "",
        providers: JSON.stringify(providers),
        status: "QUEUED",
        progress: 0,
        step: "RESUME_ANALYSIS",
        providerStatuses: JSON.stringify(
          providers.reduce((acc, p) => ({ ...acc, [p]: { status: "queued" } }), {})
        ),
      },
    });

    runSearchJob(searchJob.id);

    return NextResponse.json({ id: searchJob.id, status: "QUEUED" });
  } catch (error) {
    console.error("Search job error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}

async function runSearchJob(jobId: string) {
  try {
    await prisma.searchJob.update({
      where: { id: jobId },
      data: { status: "RUNNING", startedAt: new Date(), progress: 10 },
    });

    const job = await prisma.searchJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    const providers = JSON.parse(job.providers) as string[];
    let scrapedOffers: any[] = [];
    
    // Étape 1: SCRAPER RÉEL avec Puppeteer (LinkedIn, Indeed, HelloWork, WTTJ)
    console.log("🚀 Using REAL SCRAPER with Puppeteer...");
    
    await prisma.searchJob.update({
      where: { id: jobId },
      data: { progress: 30, step: "PROVIDER_FETCH" },
    });
    
    try {
      // SCRAPING 100% RÉEL avec Puppeteer - pas de données simulées
      const realResults = await scrapeAllJobSites(
        job.query,
        job.location || "Paris"
      );
      
      if (realResults.length > 0) {
        console.log(`✅ Found ${realResults.length} REAL jobs from web scraping`);
        scrapedOffers = realResults.map(jobOffer => ({
          sourceProvider: jobOffer.source,
          externalId: `${jobOffer.source}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: jobOffer.title,
          companyName: jobOffer.company,
          location: jobOffer.location,
          contractType: jobOffer.contractType,
          description: jobOffer.description,
          skills: JSON.stringify(jobOffer.skills || []),
          sourceUrl: jobOffer.url,
          publishedAt: jobOffer.postedDate,
        }));
      } else {
        console.log("⚠️ No real jobs found from scraping");
      }
    } catch (scrapeError) {
      console.error("⚠️ Real scraping failed:", scrapeError);
      // Pas de fallback - 100% données réelles uniquement
    }
    
    // Étape 2: Si pas de résultats du scraping réel, on retourne une liste vide
    // PAS DE DONNÉES SIMULÉES - 100% réel uniquement
    if (scrapedOffers.length === 0) {
      console.log("⚠️ Aucune offre réelle trouvée - pas de simulation");
    }

    await prisma.searchJob.update({
      where: { id: jobId },
      data: { progress: 60, step: "DEDUPLICATION" },
    });

    // Étape 3: Sauvegarder dans la base
    const savedOffers: any[] = [];
    for (const offer of scrapedOffers) {
      const saved = await prisma.jobOffer.upsert({
        where: {
          sourceProvider_externalId: {
            sourceProvider: offer.sourceProvider,
            externalId: offer.externalId,
          },
        },
        create: offer,
        update: offer,
      });
      savedOffers.push(saved);
    }

    // Étape 4: Vérifier les alertes de l'utilisateur et créer des notifications
    try {
      const offersForAlerts = savedOffers.map(o => ({
        id: o.id,
        title: o.title,
        companyName: o.companyName,
        location: o.location || "",
        contractType: o.contractType || "",
        description: o.description || "",
        skills: o.skills || "",
      }));
      
      await checkJobAlertsForUser(job.userId, offersForAlerts);
      console.log("🔔 Job alerts checked for user");
    } catch (alertError) {
      console.error("Error checking job alerts:", alertError);
    }

    await prisma.searchJob.update({
      where: { id: jobId },
      data: {
        status: "DONE",
        progress: 100,
        step: "RECOMMENDATIONS",
        resultsCount: scrapedOffers.length,
        finishedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Search job execution error:", error);
    await prisma.searchJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
        finishedAt: new Date(),
      },
    });
  }
}

// Fonction de génération supprimée - 100% données réelles uniquement via Puppeteer
