import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Créer ou continuer une conversation
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, userMessage, assistantMessage, model, attachments } = body;

    let conversation;

    if (conversationId) {
      // Continuer une conversation existante
      conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId, userId: session.id },
      });

      if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }
    } else {
      // Créer une nouvelle conversation
      const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
      conversation = await prisma.aIConversation.create({
        data: {
          userId: session.id,
          title,
        },
      });
    }

    // Sauvegarder le message utilisateur
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: userMessage,
        attachments: attachments ? JSON.stringify(attachments) : null,
      },
    });

    // Sauvegarder la réponse de l'assistant
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: assistantMessage,
        model: model || "gpt-4o-mini",
      },
    });

    // Mettre à jour le timestamp de la conversation
    await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Extraire et sauvegarder les insights si pertinent
    await extractAndSaveInsights(session.id, conversation.id, userMessage, assistantMessage);

    return NextResponse.json({
      conversationId: conversation.id,
      success: true,
    });
  } catch (error) {
    console.error("Conversation save error:", error);
    return NextResponse.json({ error: "Failed to save conversation" }, { status: 500 });
  }
}

// Récupérer les conversations de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("id");

    if (conversationId) {
      // Récupérer une conversation spécifique avec ses messages
      const conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId, userId: session.id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
          insights: true,
        },
      });

      if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }

      return NextResponse.json({ conversation });
    }

    // Récupérer toutes les conversations (liste)
    const conversations = await prisma.aIConversation.findMany({
      where: { userId: session.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Conversation fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

// Fonction pour extraire et sauvegarder les insights
async function extractAndSaveInsights(
  userId: string,
  conversationId: string,
  userMessage: string,
  assistantMessage: string
) {
  const userLower = userMessage.toLowerCase();
  const assistantLower = assistantMessage.toLowerCase();

  const insights: Array<{ type: string; content: string; metadata?: string }> = [];

  // Détecter les objectifs de carrière
  if (
    userLower.includes("objectif") ||
    userLower.includes("carrière") ||
    userLower.includes("cherche") ||
    userLower.includes("veux travailler") ||
    userLower.includes("stage")
  ) {
    // Sauvegarder comme objectif de carrière
    await prisma.careerObjective.upsert({
      where: {
        id: `${userId}-latest`,
      },
      create: {
        id: `${userId}-latest`,
        userId,
        objective: userMessage,
        isActive: true,
      },
      update: {
        objective: userMessage,
        updatedAt: new Date(),
      },
    });
  }

  // Détecter les recommandations d'entreprises
  if (
    assistantLower.includes("entreprise") ||
    assistantLower.includes("recommand") ||
    assistantLower.includes("postuler")
  ) {
    insights.push({
      type: "company_recommendation",
      content: assistantMessage.slice(0, 500),
    });
  }

  // Détecter les conseils CV
  if (
    assistantLower.includes("cv") ||
    assistantLower.includes("améliorer") ||
    assistantLower.includes("harvard")
  ) {
    insights.push({
      type: "cv_improvement",
      content: assistantMessage.slice(0, 500),
    });
  }

  // Détecter les suggestions de compétences
  if (
    assistantLower.includes("compétence") ||
    assistantLower.includes("skill") ||
    assistantLower.includes("apprendre")
  ) {
    insights.push({
      type: "skill_suggestion",
      content: assistantMessage.slice(0, 500),
    });
  }

  // Détecter les conseils stratégiques
  if (
    assistantLower.includes("stratégie") ||
    assistantLower.includes("conseil") ||
    assistantLower.includes("plan")
  ) {
    insights.push({
      type: "strategy",
      content: assistantMessage.slice(0, 500),
    });
  }

  // Détecter les conseils d'entretien
  if (
    assistantLower.includes("entretien") ||
    assistantLower.includes("interview") ||
    assistantLower.includes("préparer")
  ) {
    insights.push({
      type: "interview_tip",
      content: assistantMessage.slice(0, 500),
    });
  }

  // Sauvegarder les insights
  for (const insight of insights) {
    await prisma.aIInsight.create({
      data: {
        userId,
        conversationId,
        type: insight.type,
        content: insight.content,
        metadata: insight.metadata,
      },
    });
  }
}
