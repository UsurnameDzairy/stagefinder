import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Récupérer les alertes de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alerts = await prisma.jobAlert.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

// POST - Créer une nouvelle alerte
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, domains, keywords, locations, contractTypes, minMatchScore, frequency } = body;

    if (!name || !domains) {
      return NextResponse.json(
        { error: "Name and domains are required" },
        { status: 400 }
      );
    }

    const alert = await prisma.jobAlert.create({
      data: {
        userId: session.id,
        name,
        domains,
        keywords: keywords || null,
        locations: locations || null,
        contractTypes: contractTypes || null,
        minMatchScore: minMatchScore || 50,
        frequency: frequency || "daily",
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}

// DELETE - Supprimer une alerte
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const alertId = searchParams.get("id");

    if (!alertId) {
      return NextResponse.json({ error: "Alert ID required" }, { status: 400 });
    }

    // Vérifier que l'alerte appartient à l'utilisateur
    const alert = await prisma.jobAlert.findFirst({
      where: { id: alertId, userId: session.id },
    });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    await prisma.jobAlert.delete({
      where: { id: alertId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}

// PATCH - Mettre à jour une alerte
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, isActive, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Alert ID required" }, { status: 400 });
    }

    // Vérifier que l'alerte appartient à l'utilisateur
    const alert = await prisma.jobAlert.findFirst({
      where: { id, userId: session.id },
    });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    const updatedAlert = await prisma.jobAlert.update({
      where: { id },
      data: {
        ...updates,
        isActive: isActive !== undefined ? isActive : alert.isActive,
      },
    });

    return NextResponse.json({ success: true, alert: updatedAlert });
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
