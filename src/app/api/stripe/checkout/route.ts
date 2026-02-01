import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId, plan, promoCode } = await req.json();

    if (!priceId || !plan) {
      return NextResponse.json(
        { error: "Price ID and plan are required" },
        { status: 400 }
      );
    }

    // Check if user already has a Stripe customer ID
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: session.id },
    });

    let customerId = existingSubscription?.stripeCustomerId;

    // Create a new customer if not exists
    if (!customerId) {
      const fullName = [session.firstName, session.lastName].filter(Boolean).join(" ") || undefined;
      const customer = await stripe.customers.create({
        email: session.email,
        name: fullName,
        metadata: {
          userId: session.id,
        },
      });
      customerId = customer.id;
    }

    // Build checkout session params
    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: session.id,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          userId: session.id,
          plan: plan,
        },
      },
      allow_promotion_codes: true, // Allow users to enter promo codes at checkout
    };

    // If a promo code is provided, try to apply it
    if (promoCode) {
      try {
        // Search for the promotion code in Stripe
        const promotionCodes = await stripe.promotionCodes.list({
          code: promoCode,
          active: true,
          limit: 1,
        });

        if (promotionCodes.data.length > 0) {
          checkoutParams.discounts = [
            {
              promotion_code: promotionCodes.data[0].id,
            },
          ];
          // Remove allow_promotion_codes if we're applying a specific code
          delete checkoutParams.allow_promotion_codes;
        }
      } catch (promoError) {
        console.error("Promo code lookup failed:", promoError);
        // Continue without the promo code
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
