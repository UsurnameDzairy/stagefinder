import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "StageFinder",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch models from OpenRouter");
    }

    const data = await response.json();
    
    // Filter and format models for our use case
    const formattedModels = data.data.map((model: any) => ({
      id: model.id,
      name: model.name,
      description: model.description || "No description available",
      contextLength: model.context_length,
      pricing: {
        prompt: model.pricing?.prompt,
        completion: model.pricing?.completion,
      },
      topProvider: model.top_provider,
    }));

    return NextResponse.json({ models: formattedModels });
  } catch (error) {
    console.error("OpenRouter models fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
