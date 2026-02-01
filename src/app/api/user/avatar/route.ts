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
    const { imageUrl, avatarData } = body;

    // Support both old URL format and new avatarData format
    const avatarValue = avatarData || imageUrl;

    if (!avatarValue || typeof avatarValue !== "string") {
      return NextResponse.json(
        { error: "Avatar data is required" },
        { status: 400 }
      );
    }

    // Update user avatar
    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: { image: avatarValue },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Avatar update error:", error);
    return NextResponse.json(
      { error: "Failed to update avatar" },
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

    // Supprimer l'avatar de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: { image: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 }
    );
  }
}
