import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get full user context for AI interview preparation
 * Returns all user data including profile, CV, skills, and applications
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get URL params
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId");

    // Fetch all user data
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        skills: true,
        resumes: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        careerObjectives: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch applications with timeline
    const applications = await prisma.application.findMany({
      where: { userId: session.id },
      include: {
        timeline: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // If specific application requested, get it separately with more details
    let targetApplication = null;
    if (applicationId) {
      targetApplication = applications.find((app) => app.id === applicationId);
    }

    // Build user context object
    const userContext = {
      // Basic info
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "User",
      email: user.email,

      // Profile details
      profile: user.profile
        ? {
            phone: user.profile.phone,
            school: user.profile.schoolName,
            educationLevel: user.profile.educationLevel,
            specialty: user.profile.specialty,
            preferredCities: user.profile.preferredCities,
            contractTypes: user.profile.contractTypes,
            domains: user.profile.domains,
            languages: user.profile.languages,
            bio: user.profile.bio,
            linkedinUrl: user.profile.linkedinUrl,
            portfolioUrl: user.profile.portfolioUrl,
          }
        : null,

      // Skills
      skills: user.skills.map((s) => ({
        name: s.name,
        category: s.category,
        level: s.level,
      })),

      // CV/Resume
      resume: user.resumes[0]
        ? {
            fileName: user.resumes[0].fileName,
            extractedText: user.resumes[0].extractedText,
            skills: user.resumes[0].skills,
            experience: user.resumes[0].experience,
            education: user.resumes[0].education,
          }
        : null,

      // Career objectives
      careerObjective: user.careerObjectives[0]
        ? {
            objective: user.careerObjectives[0].objective,
            targetRoles: user.careerObjectives[0].targetRoles,
            targetSectors: user.careerObjectives[0].targetSectors,
            targetCompanies: user.careerObjectives[0].targetCompanies,
            salaryRange: user.careerObjectives[0].salaryRange,
            timeline: user.careerObjectives[0].timeline,
            priorities: user.careerObjectives[0].priorities,
          }
        : null,

      // All applications summary
      applicationsSummary: {
        total: applications.length,
        byStatus: {
          applied: applications.filter((a) => a.status === "APPLIED").length,
          inProgress: applications.filter((a) => a.status === "IN_PROGRESS").length,
          interview: applications.filter((a) => a.status === "INTERVIEW").length,
          offer: applications.filter((a) => a.status === "OFFER").length,
          rejected: applications.filter((a) => a.status === "REJECTED").length,
        },
      },

      // Target application for interview prep
      targetApplication: targetApplication
        ? {
            id: targetApplication.id,
            companyName: targetApplication.companyName,
            jobTitle: targetApplication.jobTitle,
            status: targetApplication.status,
            appliedAt: targetApplication.appliedAt,
            interviewAt: targetApplication.interviewAt,
            responseType: targetApplication.responseType,
            responseContent: targetApplication.responseContent,
            notes: targetApplication.notes,
            feedback: targetApplication.feedback,
            companyUrl: targetApplication.companyUrl,
            contactEmail: targetApplication.contactEmail,
            timeline: targetApplication.timeline.map((t) => ({
              type: t.type,
              title: t.title,
              description: t.description,
              createdAt: t.createdAt,
            })),
          }
        : null,

      // Recent applications for context
      recentApplications: applications.slice(0, 5).map((app) => ({
        companyName: app.companyName,
        jobTitle: app.jobTitle,
        status: app.status,
        responseType: app.responseType,
        appliedAt: app.appliedAt,
      })),
    };

    return NextResponse.json({
      success: true,
      context: userContext,
    });
  } catch (error) {
    console.error("User context fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch user context" }, { status: 500 });
  }
}
