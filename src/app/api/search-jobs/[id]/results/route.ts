import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
      take: 50,
    });

    const formattedOffers = offers.map((offer) => ({
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
