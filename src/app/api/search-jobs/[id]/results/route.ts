import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Filtre STRICT par localisation - UNIQUEMENT la ville demandée
function matchesRequestedLocation(offerLocation: string, requestedLocation: string): boolean {
  if (!requestedLocation || requestedLocation.trim() === '') return true;
  
  const offerLoc = (offerLocation || '').toLowerCase().trim();
  const reqLoc = requestedLocation.toLowerCase().trim();
  
  // Mappings STRICTS de villes (UNIQUEMENT ce qui est vraiment équivalent)
  const cityMappings: Record<string, string[]> = {
    'monaco': ['monaco', 'monte-carlo', 'monte carlo', 'principauté'],
    'paris': ['paris'],
    'london': ['london', 'londres'],
    'londres': ['london', 'londres'],
    'suisse': ['suisse', 'switzerland', 'schweiz', 'zurich', 'zürich', 'geneva', 'genève', 'lausanne', 'bern', 'basel', 'vaud', 'gland'],
    'switzerland': ['suisse', 'switzerland', 'schweiz', 'zurich', 'zürich', 'geneva', 'genève', 'lausanne', 'bern', 'basel', 'vaud', 'gland'],
    'zurich': ['zurich', 'zürich'],
    'geneva': ['geneva', 'genève', 'geneve'],
    'genève': ['geneva', 'genève', 'geneve'],
    'luxembourg': ['luxembourg', 'luxemburg'],
    'milan': ['milan', 'milano'],
    'frankfurt': ['frankfurt', 'francfort'],
    'madrid': ['madrid'],
    'barcelona': ['barcelona', 'barcelone'],
    'barcelone': ['barcelona', 'barcelone'],
    'nice': ['nice', 'alpes-maritimes', '06'],
    'lyon': ['lyon', 'rhône'],
    'marseille': ['marseille'],
  };
  
  // Obtenir les termes acceptés pour la localisation demandée
  const acceptedTerms = cityMappings[reqLoc] || [reqLoc];
  
  // Vérifier si l'offre correspond à un des termes acceptés
  for (const term of acceptedTerms) {
    if (offerLoc.includes(term)) {
      return true;
    }
  }
  
  // Correspondance directe
  if (offerLoc.includes(reqLoc)) {
    return true;
  }
  
  // REJETER tout le reste
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

    const offers = await prisma.jobOffer.findMany({
      where: {
        title: { contains: job.query },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Prendre plus pour avoir assez après filtrage
    });

    // FILTRE STRICT PAR LOCALISATION
    const filteredOffers = offers.filter(offer => 
      matchesRequestedLocation(offer.location || '', job.location || '')
    );

    console.log(`📍 Results filter: ${filteredOffers.length}/${offers.length} offres pour "${job.location}"`);

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
