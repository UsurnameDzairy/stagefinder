import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Nettoie les fausses données générées de la base de données
 * Ne garde que les vraies offres scrapées
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Patterns de fausses données à supprimer
    const fakePatterns = [
      // Titres générés
      '%Graduate Program%',
      '%Summer Analyst%',
      '%Spring Week%',
      '%VIE%',
      // Entreprises souvent générées
      '%Amazon%',
      '%Goldman Sachs%',
      '%Morgan Stanley%',
      '%JP Morgan%',
      '%McKinsey%',
      '%BCG%',
      '%Bain%',
    ];

    // Supprimer les offres avec des URLs générées (contiennent des patterns fake)
    const deletedFakeUrls = await prisma.jobOffer.deleteMany({
      where: {
        OR: [
          // URLs générées avec des IDs aléatoires
          { sourceUrl: { contains: 'viewjob?jk=' } },
          { sourceUrl: { contains: '/jobs/view/' } },
          // Descriptions génériques
          { description: { contains: 'Rejoignez une équipe internationale' } },
          { description: { contains: 'environnement stimulant' } },
          // ExternalIds générés
          { externalId: { contains: '-indeed-' } },
          { externalId: { contains: '-linkedin-' } },
          { externalId: { contains: '-wttj-' } },
          { externalId: { contains: '-hellowork-' } },
        ]
      }
    });

    console.log(`🗑️ Deleted ${deletedFakeUrls.count} fake job offers`);

    // Compter les offres restantes
    const remainingOffers = await prisma.jobOffer.count();

    return NextResponse.json({
      success: true,
      deleted: deletedFakeUrls.count,
      remaining: remainingOffers,
      message: `Supprimé ${deletedFakeUrls.count} fausses offres. ${remainingOffers} offres restantes.`
    });
  } catch (error) {
    console.error("Clean fake data error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clean data" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Supprimer TOUTES les offres pour repartir de zéro
    const deleted = await prisma.jobOffer.deleteMany({});
    
    console.log(`🗑️ Deleted ALL ${deleted.count} job offers - clean slate`);

    return NextResponse.json({
      success: true,
      deleted: deleted.count,
      message: `Base nettoyée. ${deleted.count} offres supprimées.`
    });
  } catch (error) {
    console.error("Delete all data error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete data" },
      { status: 500 }
    );
  }
}
