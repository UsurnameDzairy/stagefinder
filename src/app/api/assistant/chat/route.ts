import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkAIRequestLimit, incrementAIUsage } from "@/lib/subscription-middleware";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin - admins bypass limits
    const isAdmin = session.role === "admin";

    if (!isAdmin) {
      // Check subscription limits
      const limitCheck = await checkAIRequestLimit(session.id);
      
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { 
            error: "Limite atteinte", 
            message: limitCheck.message,
            plan: limitCheck.plan 
          },
          { status: 429 }
        );
      }
    }

    const { messages, conversationId } = await req.json();

    // Your existing chat logic here
    // ... (OpenRouter API call, etc.)

    // Increment usage only if not admin
    if (!isAdmin) {
      await incrementAIUsage(session.id);
    }

    // Return response
    return NextResponse.json({ 
      success: true,
      // ... your response data
    });

  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
