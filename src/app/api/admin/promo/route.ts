import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Create a new promo code (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { code, type, discountPercent, description, maxUses, validUntil } = await req.json();

    if (!code || !type) {
      return NextResponse.json(
        { error: "Code and type are required" },
        { status: 400 }
      );
    }

    // Create the promo code
    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        type,
        discountPercent: type === "STUDENT_DISCOUNT" ? (discountPercent || 50) : null,
        description,
        maxUses,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });

    return NextResponse.json({
      success: true,
      promoCode,
    });
  } catch (error: any) {
    console.error("Create promo code error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A promo code with this code already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create promo code" },
      { status: 500 }
    );
  }
}

// Get all promo codes (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const promoCodes = await prisma.promoCode.findMany({
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ promoCodes });
  } catch (error) {
    console.error("Get promo codes error:", error);
    return NextResponse.json(
      { error: "Failed to get promo codes" },
      { status: 500 }
    );
  }
}

// Delete a promo code (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.promoCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete promo code error:", error);
    return NextResponse.json(
      { error: "Failed to delete promo code" },
      { status: 500 }
    );
  }
}
