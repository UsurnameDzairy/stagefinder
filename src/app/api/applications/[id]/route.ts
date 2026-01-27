import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const application = await prisma.application.findFirst({
      where: { id, userId: session.id },
      include: {
        timeline: {
          orderBy: { createdAt: "desc" },
        },
        offer: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Application fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Vérifier que l'application appartient à l'utilisateur
    const existing = await prisma.application.findFirst({
      where: { id, userId: session.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const {
      status,
      notes,
      emailSent,
      emailContent,
      responseReceived,
      responseType,
      responseContent,
      responseScreenshot,
      contactEmail,
      contactName,
      interviewAt,
      nextAction,
      nextActionAt,
      feedback,
      finalOutcome,
    } = body;

    // Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {};
    
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactName !== undefined) updateData.contactName = contactName;
    if (interviewAt !== undefined) updateData.interviewAt = interviewAt ? new Date(interviewAt) : null;
    if (nextAction !== undefined) updateData.nextAction = nextAction;
    if (nextActionAt !== undefined) updateData.nextActionAt = nextActionAt ? new Date(nextActionAt) : null;
    if (feedback !== undefined) updateData.feedback = feedback;
    if (finalOutcome !== undefined) updateData.finalOutcome = finalOutcome;

    // Gérer l'envoi d'email
    if (emailSent && !existing.emailSent) {
      updateData.emailSent = true;
      updateData.emailSentAt = new Date();
      updateData.emailContent = emailContent;
      updateData.lastContactAt = new Date();

      // Créer un événement
      await prisma.applicationEvent.create({
        data: {
          applicationId: id,
          type: "email_sent",
          title: "Email envoyé",
          description: "Email de candidature envoyé à l'entreprise",
        },
      });
    }

    // Gérer la réponse reçue
    if (responseReceived && !existing.responseReceived) {
      updateData.responseReceived = true;
      updateData.responseReceivedAt = new Date();
      updateData.responseType = responseType;
      updateData.responseContent = responseContent;
      if (responseScreenshot) updateData.responseScreenshot = responseScreenshot;
      updateData.lastContactAt = new Date();

      // Mettre à jour le statut selon le type de réponse
      if (responseType === "positive" || responseType === "interview") {
        updateData.status = "INTERVIEW";
      } else if (responseType === "negative") {
        updateData.status = "REJECTED";
      }

      // Créer un événement
      await prisma.applicationEvent.create({
        data: {
          applicationId: id,
          type: "response_received",
          title: responseType === "positive" ? "Réponse positive" :
                 responseType === "interview" ? "Entretien proposé" :
                 responseType === "negative" ? "Réponse négative" : "Réponse reçue",
          description: responseContent?.substring(0, 200) || "Réponse de l'entreprise reçue",
          metadata: JSON.stringify({ responseType }),
        },
      });
    }

    // Gérer le changement de statut
    if (status && status !== existing.status) {
      const statusLabels: Record<string, string> = {
        APPLIED: "Candidature envoyée",
        IN_PROGRESS: "En cours de traitement",
        INTERVIEW: "Entretien programmé",
        OFFER: "Offre reçue",
        REJECTED: "Candidature refusée",
        WITHDRAWN: "Candidature retirée",
      };

      await prisma.applicationEvent.create({
        data: {
          applicationId: id,
          type: "status_change",
          title: statusLabels[status] || "Statut mis à jour",
          description: `Statut changé de ${existing.status} à ${status}`,
        },
      });
    }

    const application = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        timeline: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Application update error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que l'application appartient à l'utilisateur
    const existing = await prisma.application.findFirst({
      where: { id, userId: session.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Application delete error:", error);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}
