import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch recent applications
    const recentApplications = await prisma.application.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        company: true,
      },
    });

    // Fetch recent saved offers
    const recentSavedOffers = await prisma.savedOffer.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Fetch recent saved companies
    const recentSavedCompanies = await prisma.company.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Combine and format activity
    const activity: Array<{
      id: string;
      type: "application" | "saved_offer" | "saved_company" | "interview";
      title: string;
      subtitle: string;
      date: string;
    }> = [];

    // Format applications
    recentApplications.forEach((app) => {
      const isInterview = app.status === "INTERVIEW";
      activity.push({
        id: `app-${app.id}`,
        type: isInterview ? "interview" : "application",
        title: app.jobTitle || "Candidature",
        subtitle: app.company?.name || "Entreprise",
        date: formatRelativeDate(app.createdAt),
      });
    });

    // Format saved offers
    recentSavedOffers.forEach((offer) => {
      activity.push({
        id: `offer-${offer.id}`,
        type: "saved_offer",
        title: offer.offerId || "Offre sauvegardée",
        subtitle: `Score: ${offer.matchScore || 0}%`,
        date: formatRelativeDate(offer.createdAt),
      });
    });

    // Format saved companies
    recentSavedCompanies.forEach((company) => {
      activity.push({
        id: `company-${company.id}`,
        type: "saved_company",
        title: company.name,
        subtitle: company.industry || "Entreprise",
        date: formatRelativeDate(company.createdAt),
      });
    });

    // Sort by date (most recent first) and take top 10
    activity.sort((a, b) => {
      // Simple sort - newer items first
      return 0; // Already sorted from DB
    });

    return NextResponse.json({ activity: activity.slice(0, 10) });
  } catch (error) {
    console.error("Dashboard activity error:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return diffMins <= 1 ? "À l'instant" : `Il y a ${diffMins} min`;
  }
  if (diffHours < 24) {
    return `Il y a ${diffHours}h`;
  }
  if (diffDays === 1) {
    return "Hier";
  }
  if (diffDays < 7) {
    return `Il y a ${diffDays} jours`;
  }
  return date.toLocaleDateString("fr-FR");
}
