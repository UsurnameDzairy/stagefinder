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
    const { messages, model, language, ignoreStoredProfile } = body as {
      messages: AssistantMessage[];
      model?: string;
      language?: string;
      ignoreStoredProfile?: boolean;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Récupérer le contexte utilisateur (ou contexte vide si CV fourni)
    let context;
    if (ignoreStoredProfile) {
      // Si un CV est fourni, utiliser un contexte vide pour que l'IA analyse le CV
      console.log("[Assistant] CV fourni - ignorant le profil stocké");
      context = {
        profile: null,
        skills: [],
        resumes: [],
        applications: [],
        savedOffers: 0,
        careerObjectives: [],
        aiInsights: [],
      };
    } else {
      try {
        context = await getUserContext(session.id);
      } catch (contextError) {
        console.error("Context fetch error:", contextError);
        context = {
          profile: null,
          skills: [],
          resumes: [],
          applications: [],
          savedOffers: 0,
          careerObjectives: [],
          aiInsights: [],
        };
      }
    }

    // Générer le prompt système
    const systemPrompt = generateSystemPrompt(context, language);

    // Ajouter le prompt système au début si pas déjà présent
    const messagesWithSystem: AssistantMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.filter(m => m.role !== "system"),
    ];

    // Générer la réponse avec le modèle sélectionné
    let response;
    try {
      response = await generateAssistantResponse(messagesWithSystem, context, model);
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      // Fallback response if the API fails
      response = `I'm sorry, I'm experiencing technical difficulties at the moment.

Here's what I can tell you based on your profile:
- You have ${context.skills.length} registered skills
- ${context.applications.length} applications in progress
- ${context.savedOffers} saved offers

In the meantime, you can:
1. Explore jobs on the "Jobs" page
2. Improve your CV on the "CV Improver" page
3. Generate cover letters

Please try again in a few moments!`;
    }

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
