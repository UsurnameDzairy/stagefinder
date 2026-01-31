import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Get user's saved models
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { aiModels: true },
    });

    console.log("[API] Get user models for user:", session.id);
    console.log("[API] aiModels from DB:", user?.aiModels);

    // Return saved models or default empty array
    return NextResponse.json({ 
      models: user?.aiModels || [] 
    });
  } catch (error) {
    console.error("Get user models error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user models" },
      { status: 500 }
    );
  }
}

// Save user's model preferences
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { models } = await req.json();

    console.log("[API] Saving models for user:", session.id);
    console.log("[API] Models to save:", JSON.stringify(models, null, 2));

    if (!Array.isArray(models)) {
      console.error("[API] Invalid models format - not an array");
      return NextResponse.json(
        { error: "Invalid models format" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.id },
      data: { aiModels: models },
    });

    console.log("[API] Models saved successfully");

    return NextResponse.json({ success: true, models });
  } catch (error) {
    console.error("Save user models error:", error);
    return NextResponse.json(
      { error: "Failed to save models" },
      { status: 500 }
    );
  }
}
