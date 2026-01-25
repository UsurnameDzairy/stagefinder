import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Filtre par localisation - Plus flexible pour inclure les offres pertinentes
function matchesRequestedLocation(offerLocation: string, requestedLocation: string): boolean {
  if (!requestedLocation || requestedLocation.trim() === '') return true;
  
  const offerLoc = (offerLocation || '').toLowerCase().trim();
  const reqLoc = requestedLocation.toLowerCase().trim();
  
  // Correspondance directe
  if (offerLoc.includes(reqLoc)) return true;
  
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
    'switzerland': ['suisse', 'switzerland', 'schweiz', 'zürich', 'zurich', 'genève', 'geneva', 'lausanne', 'bern', 'basel'],
    'luxembourg': ['luxembourg', 'luxemburg'],
    'london': ['london', 'londres', 'uk', 'united kingdom'],
    'londres': ['london', 'londres', 'uk', 'united kingdom'],
    'milan': ['milan', 'milano'],
    'frankfurt': ['frankfurt', 'francfort'],
    'madrid': ['madrid'],
    'barcelona': ['barcelona', 'barcelone'],
    'barcelone': ['barcelona', 'barcelone'],
  };
  
  // Vérifier les mappings
  const acceptedTerms = locationMappings[reqLoc] || [reqLoc];
  for (const term of acceptedTerms) {
    if (offerLoc.includes(term)) return true;
  }
  
  // Si l'offre ne mentionne pas de localisation spécifique, l'inclure
  if (!offerLoc || offerLoc === 'france' || offerLoc === 'remote' || offerLoc === 'télétravail') {
    return true;
  }
  
  return false;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await prisma.searchJob.findUnique({
      where: { id, userId: session.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Récupérer toutes les offres créées récemment (dernières 24 heures)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // D'abord, compter toutes les offres récentes
    const totalRecent = await prisma.jobOffer.count({
      where: { createdAt: { gte: oneDayAgo } },
    });
    
    console.log(`📊 Total offres récentes (24h): ${totalRecent}`);
    
    const offers = await prisma.jobOffer.findMany({
      where: {
        createdAt: { gte: oneDayAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // Filtrer par localisation si demandé
    let filteredOffers = offers;
    if (job.location && job.location.trim()) {
      filteredOffers = offers.filter(offer => 
        matchesRequestedLocation(offer.location || '', job.location || '')
      );
    }

    console.log(`📍 Results: ${filteredOffers.length}/${offers.length} offres pour "${job.query}" à "${job.location}"`);

    const formattedOffers = filteredOffers.map((offer) => ({
      id: offer.id,
      title: offer.title,
      companyName: offer.companyName,
      location: offer.location || "Non specifie",
      contractType: offer.contractType || "Non specifie",
      matchScore: Math.floor(Math.random() * 30) + 70,
      skills: offer.skills ? JSON.parse(offer.skills) : [],
      sourceProvider: offer.sourceProvider,
      sourceUrl: offer.sourceUrl,
      publishedAt: offer.publishedAt,
    }));

    return NextResponse.json({ offers: formattedOffers });
  } catch (error) {
    console.error("Get results error:", error);
    return NextResponse.json({ error: "Failed to get results" }, { status: 500 });
  }
}
