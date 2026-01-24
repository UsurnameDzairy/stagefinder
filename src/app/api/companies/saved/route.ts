import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companies = await prisma.savedCompany.findMany({
      where: { userId: session.id },
      include: { company: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Error fetching saved companies:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { companyName, sector, website, location, notes } = body;

    if (!companyName) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    // Créer ou récupérer l'entreprise
    let company = await prisma.company.findFirst({
      where: { name: companyName },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: companyName,
          sector: sector || null,
          website: website || null,
          location: location || null,
        },
      });
    }

    // Vérifier si déjà sauvegardée
    const existing = await prisma.savedCompany.findFirst({
      where: {
        userId: session.id,
        companyId: company.id,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Company already saved" }, { status: 400 });
    }

    // Sauvegarder l'entreprise
    const savedCompany = await prisma.savedCompany.create({
      data: {
        userId: session.id,
        companyId: company.id,
        notes: notes || null,
      },
      include: { company: true },
    });

    return NextResponse.json({ success: true, savedCompany });
  } catch (error) {
    console.error("Error saving company:", error);
    return NextResponse.json({ error: "Failed to save company" }, { status: 500 });
  }
}
