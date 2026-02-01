// Set user as admin
// Run with: npx tsx scripts/set-admin.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "wanis.bensalah@icloud.com";

  const user = await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });

  console.log(`✅ User ${email} is now admin!`);
  console.log(user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
