import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's saved models from database
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: { aiModels: true }
        });

        // Default models if user hasn't customized
        const defaultModels = [
            {
                id: "llama-3.3",
                name: "Llama 3.3",
                description: "Modèle puissant et rapide",
                badge: "GRATUIT",
                apiModel: "meta-llama/llama-3.3-70b-instruct",
                provider: "openrouter"
            },
            {
                id: "llama-3.1-fast",
                name: "Llama 3.1 Fast",
                description: "Ultra rapide pour des réponses simples",
                badge: "GRATUIT",
                apiModel: "meta-llama/llama-3.1-8b-instruct:free",
                provider: "openrouter"
            },
            {
                id: "mistral-nemo",
                name: "Mistral Nemo",
                description: "Excellent pour l'analyse de documents",
                badge: "GRATUIT",
                apiModel: "mistralai/mistral-nemo",
                provider: "openrouter"
            },
            {
                id: "gemma-2",
                name: "Gemma 2",
                description: "Modèle Google compact et efficace",
                badge: "GRATUIT",
                apiModel: "google/gemma-2-9b-it:free",
                provider: "openrouter"
            }
        ];

        const models = user?.aiModels || defaultModels;

        return NextResponse.json({ models });
    } catch (error) {
        console.error("Error fetching models:", error);
        return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { models } = await req.json();

        // Save user's custom models
        await prisma.user.update({
            where: { id: session.id },
            data: { aiModels: models }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving models:", error);
        return NextResponse.json({ error: "Failed to save models" }, { status: 500 });
    }
}
