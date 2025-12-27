import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Export des entreprises avec offres d'emploi en CSV
 * Bien catégorisé par secteur, localisation, type de contrat
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sector = searchParams.get("sector");
    const location = searchParams.get("location");
    const contractType = searchParams.get("contractType");

    // Récupérer toutes les offres avec filtres optionnels
    const offers = await prisma.jobOffer.findMany({
      where: {
        ...(location ? { location: { contains: location, mode: "insensitive" } } : {}),
        ...(contractType ? { contractType } : {}),
      },
      orderBy: [
        { companyName: "asc" },
        { publishedAt: "desc" },
      ],
      take: 1000, // Limite à 1000 offres
    });

    // Grouper par entreprise et catégoriser
    const companiesMap = new Map<string, {
      company: string;
      sector: string;
      locations: Set<string>;
      contractTypes: Set<string>;
      jobTitles: string[];
      totalOffers: number;
      latestOffer: Date;
      skills: Set<string>;
      sources: Set<string>;
    }>();

    offers.forEach(offer => {
      const company = offer.companyName;
      
      if (!companiesMap.has(company)) {
        companiesMap.set(company, {
          company,
          sector: detectSector(offer.title, offer.description || ""),
          locations: new Set(),
          contractTypes: new Set(),
          jobTitles: [],
          totalOffers: 0,
          latestOffer: offer.publishedAt || new Date(),
          skills: new Set(),
          sources: new Set(),
        });
      }

      const companyData = companiesMap.get(company)!;
      companyData.locations.add(offer.location || "Non spécifié");
      companyData.contractTypes.add(offer.contractType || "Non spécifié");
      companyData.jobTitles.push(offer.title);
      companyData.totalOffers++;
      companyData.sources.add(offer.sourceProvider);
      
      if (offer.publishedAt && offer.publishedAt > companyData.latestOffer) {
        companyData.latestOffer = offer.publishedAt;
      }

      // Extraire les compétences
      if (offer.skills) {
        try {
          const skillsArray = JSON.parse(offer.skills);
          skillsArray.forEach((skill: string) => companyData.skills.add(skill));
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    // Filtrer par secteur si spécifié
    let companies = Array.from(companiesMap.values());
    if (sector) {
      companies = companies.filter(c => c.sector.toLowerCase() === sector.toLowerCase());
    }

    // Générer le CSV
    const csvLines: string[] = [];
    
    // En-têtes
    csvLines.push([
      "Entreprise",
      "Secteur",
      "Localisations",
      "Types de contrat",
      "Nombre d'offres",
      "Dernière offre",
      "Postes disponibles",
      "Compétences recherchées",
      "Sources",
    ].join(";"));

    // Données
    companies.forEach(company => {
      csvLines.push([
        escapeCSV(company.company),
        escapeCSV(company.sector),
        escapeCSV(Array.from(company.locations).join(", ")),
        escapeCSV(Array.from(company.contractTypes).join(", ")),
        company.totalOffers.toString(),
        company.latestOffer.toLocaleDateString("fr-FR"),
        escapeCSV(company.jobTitles.slice(0, 5).join(", ") + (company.jobTitles.length > 5 ? "..." : "")),
        escapeCSV(Array.from(company.skills).slice(0, 10).join(", ")),
        escapeCSV(Array.from(company.sources).join(", ")),
      ].join(";"));
    });

    const csvContent = csvLines.join("\n");
    
    // Ajouter BOM UTF-8 pour Excel
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    // Retourner le CSV
    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="entreprises-offres-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
  }
}

/**
 * Détecter le secteur d'activité
 */
function detectSector(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  const sectors: Record<string, string[]> = {
    "Tech / IT": ["développeur", "developer", "software", "tech", "it", "data", "cloud", "devops", "frontend", "backend", "fullstack"],
    "Finance": ["finance", "bank", "trading", "investment", "comptable", "audit", "risk", "analyst financier"],
    "Consulting": ["consultant", "consulting", "strategy", "conseil", "advisory"],
    "Marketing / Communication": ["marketing", "communication", "digital", "social media", "content", "brand", "publicité"],
    "Ressources Humaines": ["rh", "human resources", "recrutement", "talent", "hr"],
    "Vente / Commercial": ["commercial", "sales", "business development", "account manager", "vente"],
    "Ingénierie": ["ingénieur", "engineer", "mécanique", "électrique", "civil", "industriel"],
    "Santé": ["santé", "health", "médical", "pharma", "infirmier", "docteur"],
    "Juridique": ["juridique", "legal", "avocat", "droit", "compliance"],
    "Logistique": ["logistique", "supply chain", "transport", "warehouse", "stock"],
    "Design / Créatif": ["design", "ux", "ui", "graphique", "créatif", "artist"],
  };

  for (const [sector, keywords] of Object.entries(sectors)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return sector;
    }
  }

  return "Autre";
}

/**
 * Échapper les caractères spéciaux pour CSV
 */
function escapeCSV(value: string): string {
  if (!value) return "";
  
  // Si contient des caractères spéciaux, entourer de guillemets
  if (value.includes(";") || value.includes('"') || value.includes("\n") || value.includes(",")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
}
