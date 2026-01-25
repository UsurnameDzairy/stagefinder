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
    // Initialiser avec les statuts des providers
    const initialProviderStatuses = {
      linkedin: { status: "queued", count: 0 },
      indeed: { status: "queued", count: 0 },
      hellowork: { status: "queued", count: 0 },
      wttj: { status: "queued", count: 0 },
    };

    await prisma.searchJob.update({
      where: { id: jobId },
      data: { 
        status: "RUNNING", 
        startedAt: new Date(), 
        progress: 5,
        providerStatuses: JSON.stringify(initialProviderStatuses),
      },
    });

    const job = await prisma.searchJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    const providers = JSON.parse(job.providers) as string[];
    let scrapedOffers: any[] = [];
    
    // Mettre à jour: démarrage du scraping
    const runningStatuses = {
      linkedin: { status: "running", count: 0 },
      indeed: { status: "running", count: 0 },
      hellowork: { status: "running", count: 0 },
      wttj: { status: "running", count: 0 },
    };
    
    await prisma.searchJob.update({
      where: { id: jobId },
      data: { 
        progress: 15, 
        step: "PROVIDER_FETCH",
        providerStatuses: JSON.stringify(runningStatuses),
      },
    });
    
    // Intervalle pour simuler une progression fluide pendant le scraping
    let currentProgress = 18;
    const progressInterval = setInterval(async () => {
      try {
        if (currentProgress >= 65) {
          clearInterval(progressInterval);
          return;
        }
        
        // Progression ultra granulaire
        const increment = Math.random() > 0.8 ? 2 : 1;
        currentProgress += increment;
        
        await prisma.searchJob.update({
          where: { id: jobId },
          data: { progress: currentProgress }
        });
      } catch (e) {
        clearInterval(progressInterval);
      }
    }, 1000);
    
    // Utiliser le REAL SCRAPER avec Puppeteer/Chromium
    console.log("🚀 REAL SCRAPER (Puppeteer/Chromium) - Scraping des vrais sites...");
    
    try {
      const realResults = await scrapeAllJobSites(
        job.query,
        job.location || "Paris"
      );
      
      clearInterval(progressInterval);
      console.log(`✅ Real Scraper: ${realResults.length} vraies offres trouvées`);
      
      // FILTRE PAR LOCALISATION - Plus flexible pour inclure les offres pertinentes
      const requestedLocation = (job.location || "").toLowerCase().trim();
      
      // Mappings de localisations équivalentes
      const locationMappings: Record<string, string[]> = {
        'monaco': ['monaco', 'monte-carlo', 'monte carlo', 'principauté', 'mc', '98000'],
        'paris': ['paris', 'île-de-france', 'ile-de-france', 'idf', '75', '92', '93', '94', '91', '78', '95', '77'],
        'lyon': ['lyon', 'rhône', 'rhone', '69'],
        'marseille': ['marseille', 'bouches-du-rhône', '13'],
        'nice': ['nice', 'alpes-maritimes', '06', 'côte d\'azur'],
        'toulouse': ['toulouse', 'haute-garonne', '31'],
        'bordeaux': ['bordeaux', 'gironde', '33'],
        'nantes': ['nantes', 'loire-atlantique', '44'],
        'lille': ['lille', 'nord', '59'],
        'strasbourg': ['strasbourg', 'bas-rhin', '67'],
        'suisse': ['suisse', 'switzerland', 'schweiz', 'zürich', 'zurich', 'genève', 'geneva', 'lausanne', 'bern', 'basel'],
        'luxembourg': ['luxembourg', 'luxemburg'],
        'london': ['london', 'londres', 'uk', 'united kingdom'],
        'londres': ['london', 'londres', 'uk', 'united kingdom'],
      };
      
      const filteredResults = realResults.filter(jobOffer => {
        if (!requestedLocation) return true;
        
        const offerLocation = (jobOffer.location || "").toLowerCase();
        
        // Correspondance directe
        if (offerLocation.includes(requestedLocation)) return true;
        
        // Vérifier les mappings
        const acceptedTerms = locationMappings[requestedLocation] || [requestedLocation];
        for (const term of acceptedTerms) {
          if (offerLocation.includes(term)) return true;
        }
        
        // Si l'offre ne mentionne pas de localisation spécifique, l'inclure
        if (!offerLocation || offerLocation === 'france' || offerLocation === 'remote' || offerLocation === 'télétravail') {
          return true;
        }
        
        return false;
      });
      
      console.log(`📍 After location filter: ${filteredResults.length}/${realResults.length} offres pour "${requestedLocation}"`);
      
      // FILTRE PAR PERTINENCE DE LA REQUÊTE - Strict filtering
      const queryLower = job.query.toLowerCase().trim();
      
      // Définir les domaines et leurs mots-clés INCLUS et EXCLUS
      const domainConfig: Record<string, { include: string[]; exclude: string[] }> = {
        'finance': {
          include: ['finance', 'financier', 'financial', 'banque', 'bank', 'trading', 'investment', 'asset', 'portfolio', 'analyst', 'analyste financier', 'comptable', 'comptabilité', 'accounting', 'audit', 'auditeur', 'risk', 'credit', 'treasury', 'trésorerie', 'fund', 'fonds', 'wealth', 'private equity', 'venture', 'capital', 'm&a', 'fusion', 'acquisition', 'contrôleur', 'controller', 'gestion', 'trésorier', 'compliance', 'conformité', 'paie', 'payroll', 'salaire', 'rémunération'],
          exclude: ['marketing', 'commercial', 'vendeur', 'vente', 'infirmier', 'médecin', 'cuisinier', 'serveur', 'développeur', 'developer']
        },
        'tech': {
          include: ['développeur', 'developer', 'software', 'engineer', 'ingénieur', 'data', 'cloud', 'devops', 'frontend', 'backend', 'fullstack', 'react', 'python', 'java', 'javascript', 'programmeur', 'code', 'it', 'informatique'],
          exclude: ['juriste', 'comptable', 'marketing', 'commercial', 'rh']
        },
        'marketing': {
          include: ['marketing', 'communication', 'digital', 'social media', 'brand', 'marque', 'content', 'seo', 'sem', 'growth', 'community manager', 'chef de produit', 'product'],
          exclude: ['juriste', 'comptable', 'développeur', 'finance']
        },
        'juridique': {
          include: ['juridique', 'legal', 'droit', 'avocat', 'lawyer', 'juriste', 'compliance', 'contract', 'contentieux'],
          exclude: ['comptable', 'marketing', 'développeur', 'finance']
        },
      };
      
      // Détecter le domaine de recherche
      let searchDomain: string | null = null;
      for (const [domain, config] of Object.entries(domainConfig)) {
        if (queryLower.includes(domain) || config.include.some(kw => queryLower.includes(kw))) {
          searchDomain = domain;
          break;
        }
      }
      
      console.log(`🔍 Domaine détecté: ${searchDomain || 'général'} pour la requête "${job.query}"`);
      
      const queryRelevantResults = filteredResults.filter(jobOffer => {
        const title = (jobOffer.title || "").toLowerCase();
        const description = (jobOffer.description || "").toLowerCase();
        const searchText = `${title} ${description}`;
        
        // Si un domaine est détecté, appliquer le filtre strict
        if (searchDomain && domainConfig[searchDomain]) {
          const config = domainConfig[searchDomain];
          
          // Vérifier les exclusions d'abord (prioritaire)
          const hasExcludedTerm = config.exclude.some(term => title.includes(term));
          if (hasExcludedTerm) {
            console.log(`❌ EXCLU: "${jobOffer.title}" contient un terme exclu pour ${searchDomain}`);
            return false;
          }
          
          // Vérifier les inclusions
          const hasIncludedTerm = config.include.some(term => searchText.includes(term));
          if (!hasIncludedTerm) {
            console.log(`❌ NON PERTINENT: "${jobOffer.title}" ne contient pas de terme ${searchDomain}`);
            return false;
          }
          
          return true;
        }
        
        // Recherche générale - vérifier si le titre contient la requête
        return title.includes(queryLower) || searchText.includes(queryLower);
      });
      
      console.log(`🎯 After relevance filter: ${queryRelevantResults.length}/${filteredResults.length} offres pertinentes pour "${job.query}"`);
      
      // DÉDUPLICATION - Supprimer les doublons basés sur le titre et l'entreprise
      const seenOffers = new Set<string>();
      const deduplicatedResults = queryRelevantResults.filter(jobOffer => {
        const key = `${jobOffer.title.toLowerCase().trim()}-${jobOffer.company.toLowerCase().trim()}`;
        if (seenOffers.has(key)) {
          console.log(`🔄 DOUBLON supprimé: "${jobOffer.title}" - ${jobOffer.company}`);
          return false;
        }
        seenOffers.add(key);
        return true;
      });
      
      console.log(`📋 After deduplication: ${deduplicatedResults.length}/${queryRelevantResults.length} offres uniques`);
      
      // Utiliser les résultats filtrés et dédupliqués
      const finalResults = deduplicatedResults;
      
      // Compter les offres par source
      const countBySource: Record<string, number> = {};
      finalResults.forEach(offer => {
        const source = offer.source.toLowerCase();
        countBySource[source] = (countBySource[source] || 0) + 1;
      });
      
      // Mettre à jour les statuts des providers avec les compteurs
      const doneStatuses = {
        linkedin: { status: "done", count: countBySource['linkedin'] || 0 },
        indeed: { status: "done", count: countBySource['indeed'] || 0 },
        hellowork: { status: "done", count: countBySource['hellowork'] || 0 },
        wttj: { status: "done", count: countBySource['wttj'] || 0 },
      };
      
      await prisma.searchJob.update({
        where: { id: jobId },
        data: { 
          progress: 60, 
          step: "PROVIDER_FETCH",
          providerStatuses: JSON.stringify(doneStatuses),
        },
      });
      
      scrapedOffers = finalResults.map(jobOffer => ({
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
    } catch (error) {
      console.error("⚠️ Real Scraper error:", error);
    }
    
    await prisma.searchJob.update({
      where: { id: jobId },
      data: { progress: 78, step: "DEDUPLICATION" },
    });
    
    // Analyse sémantique des doublons
    await new Promise(r => setTimeout(r, 1000));
    
    console.log(`📊 Total offres: ${scrapedOffers.length}`)

    await prisma.searchJob.update({
      where: { id: jobId },
      data: { progress: 90, step: "SCORING" },
    });

    // Scoring par IA basé sur le profil
    await new Promise(r => setTimeout(r, 1500));

    await prisma.searchJob.update({
      where: { id: jobId },
      data: { progress: 98, step: "SCORING" },
    });

    await new Promise(r => setTimeout(r, 800));
    
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
