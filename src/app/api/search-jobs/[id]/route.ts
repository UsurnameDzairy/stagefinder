import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await prisma.searchJob.findUnique({
      where: { id, userId: session.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      progress: job.progress,
      step: job.step,
      providerStatuses: job.providerStatuses ? JSON.parse(job.providerStatuses) : {},
      resultsCount: job.resultsCount,
      error: job.error,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt,
    });
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json({ error: "Failed to get job" }, { status: 500 });
  }
}
