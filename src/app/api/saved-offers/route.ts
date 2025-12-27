import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savedOffers = await prisma.savedOffer.findMany({
      where: { userId: session.id },
      include: { offer: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ savedOffers });
  } catch (error) {
    console.error("Saved offers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch saved offers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { offerId, matchScore, notes } = body;

    if (!offerId) {
      return NextResponse.json({ error: "Offer ID required" }, { status: 400 });
    }

    // Vérifier si l'offre existe
    const offer = await prisma.jobOffer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Créer ou mettre à jour la sauvegarde
    const savedOffer = await prisma.savedOffer.upsert({
      where: {
        userId_offerId: {
          userId: session.id,
          offerId,
        },
      },
      create: {
        userId: session.id,
        offerId,
        matchScore,
        notes,
      },
      update: {
        matchScore,
        notes,
      },
    });

    return NextResponse.json({ success: true, savedOffer });
  } catch (error) {
    console.error("Save offer error:", error);
    return NextResponse.json({ error: "Failed to save offer" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const offerId = searchParams.get("offerId");

    if (!offerId) {
      return NextResponse.json({ error: "Offer ID required" }, { status: 400 });
    }

    await prisma.savedOffer.delete({
      where: {
        userId_offerId: {
          userId: session.id,
          offerId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete saved offer error:", error);
    return NextResponse.json({ error: "Failed to delete saved offer" }, { status: 500 });
  }
}
