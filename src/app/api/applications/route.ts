import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canPerformAction, incrementUsage } from "@/lib/usage-limits";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { userId: session.id },
      include: {
        timeline: {
          orderBy: { createdAt: "desc" },
        },
        offer: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    // Calculer les statistiques
    const stats = {
      total: applications.length,
      applied: applications.filter(a => a.status === "APPLIED").length,
      inProgress: applications.filter(a => a.status === "IN_PROGRESS").length,
      interview: applications.filter(a => a.status === "INTERVIEW").length,
      offer: applications.filter(a => a.status === "OFFER").length,
      rejected: applications.filter(a => a.status === "REJECTED").length,
      pending: applications.filter(a => !a.responseReceived && a.emailSent).length,
    };

    return NextResponse.json({ applications, stats });
  } catch (error) {
    console.error("Applications fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check usage limits before creating application
    const usageCheck = await canPerformAction(session.id, "application");
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: "Usage limit reached",
          message: usageCheck.reason,
          usage: usageCheck.usage,
          limitReached: true,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      offerId,
      companyName,
      jobTitle,
      contactEmail,
      contactName,
      companyUrl,
      notes,
    } = body;

    // Create the application
    const application = await prisma.application.create({
      data: {
        userId: session.id,
        offerId,
        companyName,
        jobTitle,
        contactEmail,
        contactName,
        companyUrl,
        notes,
        status: "APPLIED",
        appliedAt: new Date(),
      },
    });

    // Create the initial event
    await prisma.applicationEvent.create({
      data: {
        applicationId: application.id,
        type: "applied",
        title: "Application created",
        description: `Applied for ${jobTitle} at ${companyName}`,
      },
    });

    // Increment usage counter after successful creation
    const usageResult = await incrementUsage(session.id, "application");

    return NextResponse.json({
      success: true,
      application,
      usage: usageResult.usage,
    });
  } catch (error) {
    console.error("Application create error:", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
