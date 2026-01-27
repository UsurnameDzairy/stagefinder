import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { PlanType } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Map price IDs to plan types
const PRICE_TO_PLAN: Record<string, PlanType> = {
  // Student plans
  "price_1Su4dcEZ2umRtYhgsugvViKb": "STUDENT", // monthly
  "price_1Su4eQEZ2umRtYhgP0jQr3p6": "STUDENT", // yearly
  // Pro plans
  "price_1Su4b2EZ2umRtYhgqMjeLJXg": "PRO", // monthly
  "price_1Su4bmEZ2umRtYhgXp1UEBLq": "PRO", // yearly
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("[Stripe Webhook] No signature found");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Event received: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as string;

  if (!userId) {
    console.error("[Stripe Webhook] No userId in session metadata");
    return;
  }

  console.log(`[Stripe Webhook] Checkout complete for user ${userId}, plan: ${plan}`);

  // Get the subscription from Stripe
  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Determine plan type from price ID
  const priceId = subscription.items.data[0]?.price.id;
  const planType = PRICE_TO_PLAN[priceId] || (plan?.toUpperCase() as PlanType) || "STUDENT";

  // Update or create subscription in database
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      plan: planType,
      status: "ACTIVE",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      userId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      plan: planType,
      status: "ACTIVE",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(`[Stripe Webhook] User ${userId} upgraded to ${planType}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!existingSubscription) {
    console.error("[Stripe Webhook] No subscription found for customer:", customerId);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const planType = PRICE_TO_PLAN[priceId] || existingSubscription.plan;

  // Map Stripe status to our status
  let status: "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING" | "INCOMPLETE" = "ACTIVE";
  if (subscription.status === "canceled") status = "CANCELED";
  else if (subscription.status === "past_due") status = "PAST_DUE";
  else if (subscription.status === "trialing") status = "TRIALING";
  else if (subscription.status === "incomplete") status = "INCOMPLETE";

  await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      stripePriceId: priceId,
      plan: planType,
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(`[Stripe Webhook] Subscription updated for user ${existingSubscription.userId}`);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!existingSubscription) {
    console.error("[Stripe Webhook] No subscription found for customer:", customerId);
    return;
  }

  // Downgrade to FREE plan
  await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      plan: "FREE",
      status: "CANCELED",
    },
  });

  console.log(`[Stripe Webhook] Subscription canceled for user ${existingSubscription.userId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (existingSubscription) {
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: { status: "ACTIVE" },
    });
    console.log(`[Stripe Webhook] Payment succeeded for user ${existingSubscription.userId}`);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (existingSubscription) {
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: { status: "PAST_DUE" },
    });
    console.log(`[Stripe Webhook] Payment failed for user ${existingSubscription.userId}`);
  }
}
