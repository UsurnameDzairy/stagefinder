import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

async function createProducts() {
  try {
    console.log("🚀 Création des produits Stripe...\n");

    // 1. Student Plan - 10$/mois
    console.log("📦 Création du plan Student...");
    const studentProduct = await stripe.products.create({
      name: "Student",
      description: "Pour les étudiants qui démarrent leur recherche de stage",
      metadata: {
        plan: "student",
        aiRequestsPerDay: "10",
        aiRequestsPerWeek: "70",
      },
    });

    const studentMonthly = await stripe.prices.create({
      product: studentProduct.id,
      unit_amount: 1000, // 10$ en centimes
      currency: "usd",
      recurring: {
        interval: "month",
      },
      metadata: {
        plan: "student",
        billing: "monthly",
      },
    });

    const studentYearly = await stripe.prices.create({
      product: studentProduct.id,
      unit_amount: 8000, // 8$/mois * 12 = 96$/an en centimes
      currency: "usd",
      recurring: {
        interval: "year",
      },
      metadata: {
        plan: "student",
        billing: "yearly",
      },
    });

    console.log(`✅ Student créé:`);
    console.log(`   - Mensuel: ${studentMonthly.id}`);
    console.log(`   - Annuel: ${studentYearly.id}\n`);

    // 2. Pro Plan - 23$/mois
    console.log("📦 Création du plan Pro...");
    const proProduct = await stripe.products.create({
      name: "Pro",
      description: "Pour les chercheurs actifs de stages et emplois",
      metadata: {
        plan: "pro",
        aiRequestsPerDay: "50",
        aiRequestsPerWeek: "350",
      },
    });

    const proMonthly = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 2300, // 23$ en centimes
      currency: "usd",
      recurring: {
        interval: "month",
      },
      metadata: {
        plan: "pro",
        billing: "monthly",
      },
    });

    const proYearly = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 18000, // 18$/mois * 12 = 216$/an en centimes
      currency: "usd",
      recurring: {
        interval: "year",
      },
      metadata: {
        plan: "pro",
        billing: "yearly",
      },
    });

    console.log(`✅ Pro créé:`);
    console.log(`   - Mensuel: ${proMonthly.id}`);
    console.log(`   - Annuel: ${proYearly.id}\n`);

    // 3. Enterprise Plan - 50$/mois
    console.log("📦 Création du plan Enterprise...");
    const enterpriseProduct = await stripe.products.create({
      name: "Enterprise",
      description: "Pour les professionnels exigeants avec besoins illimités",
      metadata: {
        plan: "enterprise",
        aiRequestsPerDay: "unlimited",
        aiRequestsPerWeek: "unlimited",
      },
    });

    const enterpriseMonthly = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 5000, // 50$ en centimes
      currency: "usd",
      recurring: {
        interval: "month",
      },
      metadata: {
        plan: "enterprise",
        billing: "monthly",
      },
    });

    const enterpriseYearly = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 40000, // 40$/mois * 12 = 480$/an en centimes
      currency: "usd",
      recurring: {
        interval: "year",
      },
      metadata: {
        plan: "enterprise",
        billing: "yearly",
      },
    });

    console.log(`✅ Enterprise créé:`);
    console.log(`   - Mensuel: ${enterpriseMonthly.id}`);
    console.log(`   - Annuel: ${enterpriseYearly.id}\n`);

    // Afficher le résumé pour copier-coller dans le code
    console.log("=" .repeat(60));
    console.log("📋 PRICE IDs À COPIER DANS pricing/page.tsx:");
    console.log("=" .repeat(60));
    console.log(`
Student:
  stripePriceId: "${studentMonthly.id}",
  stripeYearlyPriceId: "${studentYearly.id}",

Pro:
  stripePriceId: "${proMonthly.id}",
  stripeYearlyPriceId: "${proYearly.id}",

Enterprise:
  stripePriceId: "${enterpriseMonthly.id}",
  stripeYearlyPriceId: "${enterpriseYearly.id}",
`);
    console.log("=" .repeat(60));
    console.log("✨ Tous les produits ont été créés avec succès!");

  } catch (error) {
    console.error("❌ Erreur lors de la création des produits:", error);
    process.exit(1);
  }
}

createProducts();
