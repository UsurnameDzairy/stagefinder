import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [savedOffers, savedCompanies, applications, interviews, matchTrend, skillsCoverage, searchActivity, applicationStatus] = await Promise.all([
      prisma.savedOffer.count({ where: { userId: session.id } }),
      prisma.savedCompany.count({ where: { userId: session.id } }),
      prisma.application.count({ where: { userId: session.id, status: { not: "NOT_APPLIED" } } }),
      prisma.application.count({ where: { userId: session.id, status: "INTERVIEW" } }),
      // Mocked for now, but structured to be easily replaceable with real logic
      Promise.resolve([65, 68, 72, 70, 75, 78, 82, 85, 80, 88, 92, 95]),
      Promise.resolve([
        { label: "Finance & Analyse", value: 85, color: "bg-white" },
        { label: "Python & Data", value: 65, color: "bg-zinc-400" },
        { label: "Communication", value: 92, color: "bg-zinc-200" },
        { label: "Stratégie", value: 45, color: "bg-zinc-700" },
      ]),
      Promise.resolve([40, 70, 45, 90, 65, 80, 55, 95, 75, 60, 85, 100]),
      Promise.resolve({
        pending: 45,
        interview: 25,
        rejected: 30,
        responseRate: 65
      })
    ]);

    return NextResponse.json({
      stats: {
        savedOffers,
        savedCompanies,
        applications,
        interviews,
        matchTrend,
        skillsCoverage,
        searchActivity,
        applicationStatus,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
