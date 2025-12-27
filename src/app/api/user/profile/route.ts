import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      phone,
      schoolName,
      educationLevel,
      specialty,
      preferredCities,
      contractTypes,
      domains,
      languages,
      bio,
      linkedinUrl,
      portfolioUrl,
      skills,
    } = body;

    // Mettre à jour les informations de base de l'utilisateur
    await prisma.user.update({
      where: { id: session.id },
      data: {
        firstName,
        lastName,
      },
    });

    // Créer ou mettre à jour le profil
    const profile = await prisma.profile.upsert({
      where: { userId: session.id },
      create: {
        userId: session.id,
        phone,
        schoolName,
        educationLevel,
        specialty,
        preferredCities,
        contractTypes,
        domains,
        languages,
        bio,
        linkedinUrl,
        portfolioUrl,
      },
      update: {
        phone,
        schoolName,
        educationLevel,
        specialty,
        preferredCities,
        contractTypes,
        domains,
        languages,
        bio,
        linkedinUrl,
        portfolioUrl,
      },
    });

    // Gérer les compétences
    if (skills && Array.isArray(skills)) {
      // Supprimer les anciennes compétences
      await prisma.userSkill.deleteMany({
        where: { userId: session.id },
      });

      // Ajouter les nouvelles compétences
      if (skills.length > 0) {
        await prisma.userSkill.createMany({
          data: skills.map((skill: string) => ({
            userId: session.id,
            name: skill,
            source: "manual",
          })),
        });
      }
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        skills: true,
      },
    });

    return NextResponse.json({
      user,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
