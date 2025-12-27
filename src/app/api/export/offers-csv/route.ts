import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Export détaillé des offres d'emploi en CSV
 * Toutes les offres avec leurs détails complets
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
    const company = searchParams.get("company");

    // Récupérer les offres avec filtres
    const offers = await prisma.jobOffer.findMany({
      where: {
        ...(location ? { location: { contains: location, mode: "insensitive" } } : {}),
        ...(contractType ? { contractType } : {}),
        ...(company ? { companyName: { contains: company, mode: "insensitive" } } : {}),
      },
      orderBy: [
        { publishedAt: "desc" },
      ],
      take: 2000,
    });

    // Générer le CSV
    const csvLines: string[] = [];
    
    // En-têtes
    csvLines.push([
      "ID",
      "Titre du poste",
      "Entreprise",
      "Secteur",
      "Localisation",
      "Type de contrat",
      "Description",
      "Compétences requises",
      "Source",
      "URL de l'offre",
      "Date de publication",
      "Date d'ajout",
    ].join(";"));

    // Données
    offers.forEach(offer => {
      const skills = offer.skills ? JSON.parse(offer.skills).join(", ") : "";
      const sector = detectSector(offer.title, offer.description || "");
      
      csvLines.push([
        escapeCSV(offer.id),
        escapeCSV(offer.title),
        escapeCSV(offer.companyName),
        escapeCSV(sector),
        escapeCSV(offer.location || "Non spécifié"),
        escapeCSV(offer.contractType || "Non spécifié"),
        escapeCSV(offer.description || ""),
        escapeCSV(skills),
        escapeCSV(offer.sourceProvider),
        escapeCSV(offer.sourceUrl || ""),
        offer.publishedAt ? offer.publishedAt.toLocaleDateString("fr-FR") : "",
        offer.createdAt.toLocaleDateString("fr-FR"),
      ].join(";"));
    });

    const csvContent = csvLines.join("\n");
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="offres-emploi-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
  }
}

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

function escapeCSV(value: string): string {
  if (!value) return "";
  
  if (value.includes(";") || value.includes('"') || value.includes("\n") || value.includes(",")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
}
