import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Color palette for skills
const skillColors = [
  "bg-white",
  "bg-blue-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-zinc-400",
];

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's skills from database
    const userSkills = await prisma.userSkill.findMany({
      where: { userId: session.id },
    });

    // Group skills by category and calculate coverage
    const categoryMap: Record<string, string[]> = {};
    for (const skill of userSkills) {
      const category = skill.category || "other";
      if (!categoryMap[category]) {
        categoryMap[category] = [];
      }
      categoryMap[category].push(skill.name);
    }

    // Create skills coverage data
    // For now, we'll show each category with a "coverage" based on number of skills
    // In a real app, this would match against job requirements
    const skillsCoverage = Object.entries(categoryMap)
      .map(([category, skills], index) => {
        // Calculate a pseudo-coverage based on number of skills in category
        // More skills = higher coverage (max 100%)
        const baseValue = Math.min(100, 50 + skills.length * 10);

        // Format category name nicely
        const categoryLabels: Record<string, string> = {
          programming: "Programming",
          data: "Data & Analytics",
          finance: "Finance",
          business: "Business & Strategy",
          softSkills: "Soft Skills",
          languages: "Languages",
          extracted: "Other Skills",
          other: "Other",
        };

        return {
          label: categoryLabels[category] || category,
          value: baseValue,
          color: skillColors[index % skillColors.length],
          skills: skills, // Include actual skills for tooltip/details
        };
      })
      .sort((a, b) => b.value - a.value); // Sort by coverage descending

    // Get application stats
    const applications = await prisma.application.findMany({
      where: { userId: session.id },
      select: { status: true },
    });

    const totalApps = applications.length;
    const appliedApps = applications.filter(a => a.status !== "NOT_APPLIED").length;
    const interviewApps = applications.filter(a => a.status === "INTERVIEW" || a.status === "OFFER").length;
    const rejectedApps = applications.filter(a => a.status === "REJECTED").length;
    const pendingApps = applications.filter(a => a.status === "APPLIED" || a.status === "IN_PROGRESS").length;

    // Calculate real percentages
    const applicationStatus = totalApps > 0 ? {
      pending: Math.round((pendingApps / totalApps) * 100),
      interview: Math.round((interviewApps / totalApps) * 100),
      rejected: Math.round((rejectedApps / totalApps) * 100),
      responseRate: appliedApps > 0 ? Math.round(((interviewApps + rejectedApps) / appliedApps) * 100) : 0,
    } : {
      pending: 0,
      interview: 0,
      rejected: 0,
      responseRate: 0,
    };

    const [savedOffers, savedCompanies] = await Promise.all([
      prisma.savedOffer.count({ where: { userId: session.id } }),
      prisma.savedCompany.count({ where: { userId: session.id } }),
    ]);

    return NextResponse.json({
      stats: {
        savedOffers,
        savedCompanies,
        applications: appliedApps,
        interviews: interviewApps,
        skillsCoverage: skillsCoverage.length > 0 ? skillsCoverage : null,
        applicationStatus: totalApps > 0 ? applicationStatus : null,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
