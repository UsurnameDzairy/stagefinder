// Script to create initial promo codes
// Run with: npx tsx scripts/create-promo-codes.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating promo codes...");

  // Student discount code - 50% off for .edu emails
  const studentCode = await prisma.promoCode.upsert({
    where: { code: "STUDENT50" },
    update: {},
    create: {
      code: "STUDENT50",
      type: "STUDENT_DISCOUNT",
      discountPercent: 50,
      description: "50% off first month for students with .edu email",
      isActive: true,
    },
  });
  console.log("Created STUDENT50:", studentCode);

  // VIP codes for family and collaborators
  const vipCodes = [
    { code: "KAMVIP2024", description: "VIP access for collaborators" },
    { code: "FAMILYKAM", description: "VIP access for family members" },
    { code: "PARTNERKAM", description: "VIP access for partners" },
  ];

  for (const vip of vipCodes) {
    const code = await prisma.promoCode.upsert({
      where: { code: vip.code },
      update: {},
      create: {
        code: vip.code,
        type: "VIP_UNLIMITED",
        description: vip.description,
        isActive: true,
      },
    });
    console.log(`Created ${vip.code}:`, code);
  }

  console.log("\n✅ All promo codes created successfully!");
  console.log("\nAvailable codes:");
  console.log("- STUDENT50: 50% off for .edu emails");
  console.log("- KAMVIP2024: VIP Pro unlimited");
  console.log("- FAMILYKAM: VIP Pro unlimited");
  console.log("- PARTNERKAM: VIP Pro unlimited");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
