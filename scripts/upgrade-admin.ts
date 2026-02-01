// Upgrade admin user to Pro unlimited
// Run with: npx tsx scripts/upgrade-admin.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "wanis.bensalah@icloud.com";

  // Update subscription to PRO unlimited
  const subscription = await prisma.subscription.upsert({
    where: { userId: "hS2RLpW8JfJeQk38l4Nw0hZVlcm9FrCO" },
    create: {
      userId: "hS2RLpW8JfJeQk38l4Nw0hZVlcm9FrCO",
      plan: "PRO",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date("2099-12-31"), // Unlimited
    },
    update: {
      plan: "PRO",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date("2099-12-31"), // Unlimited
    },
  });

  console.log(`✅ User ${email} upgraded to PRO unlimited!`);
  console.log(subscription);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
