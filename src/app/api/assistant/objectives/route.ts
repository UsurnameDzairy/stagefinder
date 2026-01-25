import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Récupérer les objectifs de carrière
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const objectives = await prisma.careerObjective.findMany({
      where: { userId: session.id, isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    // Récupérer aussi les insights récents pour enrichir le contexte
    const insights = await prisma.aIInsight.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ objectives, insights });
  } catch (error) {
    console.error("Objectives fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch objectives" }, { status: 500 });
  }
}

// Créer ou mettre à jour un objectif de carrière
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      objective,
      targetRoles,
      targetSectors,
      targetCompanies,
      salaryRange,
      timeline,
      priorities,
      constraints,
    } = body;

    if (!objective) {
      return NextResponse.json({ error: "Objective is required" }, { status: 400 });
    }

    const careerObjective = await prisma.careerObjective.create({
      data: {
        userId: session.id,
        objective,
        targetRoles: targetRoles ? JSON.stringify(targetRoles) : null,
        targetSectors: targetSectors ? JSON.stringify(targetSectors) : null,
        targetCompanies: targetCompanies ? JSON.stringify(targetCompanies) : null,
        salaryRange,
        timeline,
        priorities: priorities ? JSON.stringify(priorities) : null,
        constraints,
      },
    });

    return NextResponse.json({ objective: careerObjective });
  } catch (error) {
    console.error("Objective create error:", error);
    return NextResponse.json({ error: "Failed to create objective" }, { status: 500 });
  }
}

// Mettre à jour un objectif
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Objective ID is required" }, { status: 400 });
    }

    // Vérifier que l'objectif appartient à l'utilisateur
    const existing = await prisma.careerObjective.findUnique({
      where: { id, userId: session.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Objective not found" }, { status: 404 });
    }

    const updated = await prisma.careerObjective.update({
      where: { id },
      data: {
        ...data,
        targetRoles: data.targetRoles ? JSON.stringify(data.targetRoles) : existing.targetRoles,
        targetSectors: data.targetSectors ? JSON.stringify(data.targetSectors) : existing.targetSectors,
        targetCompanies: data.targetCompanies ? JSON.stringify(data.targetCompanies) : existing.targetCompanies,
        priorities: data.priorities ? JSON.stringify(data.priorities) : existing.priorities,
      },
    });

    return NextResponse.json({ objective: updated });
  } catch (error) {
    console.error("Objective update error:", error);
    return NextResponse.json({ error: "Failed to update objective" }, { status: 500 });
  }
}

// Supprimer un objectif
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Objective ID is required" }, { status: 400 });
    }

    await prisma.careerObjective.deleteMany({
      where: { id, userId: session.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Objective delete error:", error);
    return NextResponse.json({ error: "Failed to delete objective" }, { status: 500 });
  }
}
