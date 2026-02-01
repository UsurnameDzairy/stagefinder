// Check user CV and skills data
// Run with: npx tsx scripts/check-user-data.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = "hS2RLpW8JfJeQk38l4Nw0hZVlcm9FrCO";

  // Get user's resumes
  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  console.log("=== RESUMES ===");
  console.log(`Found ${resumes.length} resume(s)`);
  for (const resume of resumes) {
    console.log(`\n📄 ${resume.fileName} (${resume.isActive ? "ACTIVE" : "inactive"})`);
    console.log(`   Created: ${resume.createdAt}`);
    console.log(`   Skills: ${resume.skills || "None"}`);
    if (resume.extractedText) {
      console.log(`   Extracted text (first 500 chars):`);
      console.log(`   ${resume.extractedText.substring(0, 500)}...`);
    }
    if (resume.parsedData) {
      console.log(`   Parsed data: ${resume.parsedData.substring(0, 500)}...`);
    }
  }

  // Get user's skills
  const skills = await prisma.userSkill.findMany({
    where: { userId },
  });

  console.log("\n\n=== USER SKILLS ===");
  console.log(`Found ${skills.length} skill(s)`);
  for (const skill of skills) {
    console.log(`   - ${skill.name} (${skill.category || "no category"}) [source: ${skill.source || "manual"}]`);
  }

  // Get user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  console.log("\n\n=== PROFILE ===");
  if (profile) {
    console.log(`   Domains: ${profile.domains || "None"}`);
    console.log(`   Education: ${profile.educationLevel || "None"}`);
    console.log(`   School: ${profile.schoolName || "None"}`);
    console.log(`   Cities: ${profile.preferredCities || "None"}`);
    console.log(`   Languages: ${profile.languages || "None"}`);
  } else {
    console.log("   No profile found");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
