import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserContext, generateSystemPrompt, generateAssistantResponse, AssistantMessage } from "@/lib/ai/assistant";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { messages } = body as { messages: AssistantMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Récupérer le contexte utilisateur
    const context = await getUserContext(session.id);

    // Générer le prompt système
    const systemPrompt = generateSystemPrompt(context);

    // Ajouter le prompt système au début si pas déjà présent
    const messagesWithSystem: AssistantMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.filter(m => m.role !== "system"),
    ];

    // Générer la réponse
    const response = await generateAssistantResponse(messagesWithSystem, context);

    return NextResponse.json({
      message: {
        role: "assistant",
        content: response,
      },
    });
  } catch (error) {
    console.error("Assistant error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer le contexte utilisateur pour afficher un résumé
    const context = await getUserContext(session.id);

    return NextResponse.json({
      context: {
        hasProfile: !!context.profile,
        skillsCount: context.skills.length,
        resumesCount: context.resumes.length,
        applicationsCount: context.applications.length,
        savedOffersCount: context.savedOffers,
      },
    });
  } catch (error) {
    console.error("Assistant context error:", error);
    return NextResponse.json(
      { error: "Failed to get context" },
      { status: 500 }
    );
  }
}
