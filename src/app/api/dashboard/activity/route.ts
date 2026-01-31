import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [applications, savedOffers, savedCompanies] = await Promise.all([
      prisma.application.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.savedOffer.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          offer: true,
        },
      }),
      prisma.savedCompany.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          company: true,
        },
      }),
    ]);

    const activities = [
      ...applications.map((app) => ({
        id: app.id,
        type: "application" as const,
        title: app.jobTitle,
        subtitle: app.companyName,
        date: app.createdAt,
      })),
      ...savedOffers.map((so) => ({
        id: so.id,
        type: "saved_offer" as const,
        title: so.offer.title,
        subtitle: so.offer.companyName,
        date: so.createdAt,
      })),
      ...savedCompanies.map((sc) => ({
        id: sc.id,
        type: "saved_company" as const,
        title: sc.company.name,
        subtitle: sc.company.sector || "Entreprise",
        date: sc.createdAt,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10)
      .map((activity) => ({
        ...activity,
        date: formatDate(activity.date),
      }));

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching dashboard activity:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `Il y a ${minutes}min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days}j`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
