import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get basic counts from database
    const savedOffers = await prisma.savedOffer.count({ where: { userId: session.id } });
    const savedCompanies = await prisma.savedCompany.count({ where: { userId: session.id } });
    const applications = await prisma.application.count({ where: { userId: session.id, status: { not: "NOT_APPLIED" } } });
    const interviews = await prisma.application.count({ where: { userId: session.id, status: "INTERVIEW" } });

    // Calculate real application status percentages
    const pending = await prisma.application.count({ where: { userId: session.id, status: "PENDING" } });
    const rejected = await prisma.application.count({ where: { userId: session.id, status: "REJECTED" } });

    const applicationStatus = applications > 0 ? {
      pending: Math.round((pending / applications) * 100),
      interview: Math.round((interviews / applications) * 100),
      rejected: Math.round((rejected / applications) * 100),
      responseRate: Math.round(((interviews + rejected) / applications) * 100)
    } : null;

    // Get user skills from profile if they exist
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { skills: true }
    });

    const skillsCoverage = user?.skills && Array.isArray(user.skills) && user.skills.length > 0
      ? user.skills.map((skill: any) => ({
        label: skill.name || skill,
        value: skill.level || 0,
        color: skill.level >= 80 ? "bg-white" : skill.level >= 60 ? "bg-zinc-400" : "bg-zinc-700"
      }))
      : null;

    return NextResponse.json({
      stats: {
        savedOffers,
        savedCompanies,
        applications,
        interviews,
        matchTrend: null, // No real data yet
        skillsCoverage,
        searchActivity: null, // No real data yet
        applicationStatus,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
