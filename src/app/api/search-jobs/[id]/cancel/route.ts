import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.searchJob.update({
      where: { id, userId: session.id },
      data: { status: "CANCELED", finishedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel job error:", error);
    return NextResponse.json({ error: "Failed to cancel" }, { status: 500 });
  }
}
