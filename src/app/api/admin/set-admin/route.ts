import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Temporary endpoint to set admin role
 * Should be removed or secured in production
 */
export async function POST(req: NextRequest) {
  try {
    const { email, secret } = await req.json();

    // Simple secret check - replace with proper auth in production
    if (secret !== "stagefinder-admin-setup-2026") {
      return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
    }

    const user = await prisma.user.update({
      where: { email },
      data: { role: "admin" },
    });

    return NextResponse.json({ 
      success: true, 
      message: `User ${email} is now an admin`,
      userId: user.id 
    });
  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      { error: "Failed to set admin role" },
      { status: 500 }
    );
  }
}
