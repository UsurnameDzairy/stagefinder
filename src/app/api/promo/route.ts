import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Apply a promo code
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Promo code is required" },
        { status: 400 }
      );
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: "Invalid promo code" },
        { status: 404 }
      );
    }

    // Check if promo code is active
    if (!promoCode.isActive) {
      return NextResponse.json(
        { error: "This promo code is no longer active" },
        { status: 400 }
      );
    }

    // Check validity period
    const now = new Date();
    if (promoCode.validUntil && now > promoCode.validUntil) {
      return NextResponse.json(
        { error: "This promo code has expired" },
        { status: 400 }
      );
    }

    if (now < promoCode.validFrom) {
      return NextResponse.json(
        { error: "This promo code is not yet valid" },
        { status: 400 }
      );
    }

    // Check max uses
    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return NextResponse.json(
        { error: "This promo code has reached its maximum uses" },
        { status: 400 }
      );
    }

    // Check if user already used this code
    const existingRedemption = await prisma.promoRedemption.findUnique({
      where: {
        promoCodeId_userId: {
          promoCodeId: promoCode.id,
          userId: session.id,
        },
      },
    });

    if (existingRedemption) {
      return NextResponse.json(
        { error: "You have already used this promo code" },
        { status: 400 }
      );
    }

    // Get user email for STUDENT_DISCOUNT validation
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // For STUDENT_DISCOUNT, verify .edu email
    if (promoCode.type === "STUDENT_DISCOUNT") {
      const isEduEmail = user.email.toLowerCase().endsWith(".edu") ||
                         user.email.toLowerCase().includes(".edu.");
      if (!isEduEmail) {
        return NextResponse.json(
          { error: "This promo code is only valid for .edu email addresses" },
          { status: 400 }
        );
      }
    }

    // Apply the promo code
    let newPlan: "FREE" | "STUDENT" | "PRO" = "FREE";
    let periodEnd: Date | null = null;

    if (promoCode.type === "VIP_UNLIMITED") {
      // VIP gets unlimited Pro access
      newPlan = "PRO";
      // Set a far future date for unlimited
      periodEnd = new Date("2099-12-31");
    } else if (promoCode.type === "STUDENT_DISCOUNT") {
      // Student gets Student plan with 50% discount
      newPlan = "STUDENT";
      // First month only
      periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Create or update subscription
    await prisma.subscription.upsert({
      where: { userId: session.id },
      create: {
        userId: session.id,
        plan: newPlan,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
      update: {
        plan: newPlan,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
    });

    // Record the redemption
    await prisma.promoRedemption.create({
      data: {
        promoCodeId: promoCode.id,
        userId: session.id,
      },
    });

    // Increment used count
    await prisma.promoCode.update({
      where: { id: promoCode.id },
      data: { usedCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      message: promoCode.type === "VIP_UNLIMITED"
        ? "VIP Pro access activated! Enjoy unlimited features."
        : "Student discount applied! Enjoy 50% off your first month.",
      plan: newPlan,
      discount: promoCode.discountPercent,
      type: promoCode.type,
    });
  } catch (error) {
    console.error("Promo code error:", error);
    return NextResponse.json(
      { error: "Failed to apply promo code" },
      { status: 500 }
    );
  }
}

// Get user's active promo codes / subscription status
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.id },
    });

    const redemptions = await prisma.promoRedemption.findMany({
      where: { userId: session.id },
      include: { promoCode: true },
    });

    return NextResponse.json({
      subscription,
      redemptions,
    });
  } catch (error) {
    console.error("Get promo status error:", error);
    return NextResponse.json(
      { error: "Failed to get promo status" },
      { status: 500 }
    );
  }
}
