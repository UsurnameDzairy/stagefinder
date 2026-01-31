import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id: params.id,
        userId: session.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, summary, newMessage } = await req.json();

    const updateData: any = {};
    if (title) updateData.title = title;
    if (summary) updateData.summary = summary;

    const conversation = await prisma.aIConversation.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (newMessage) {
      await prisma.aIMessage.create({
        data: {
          conversationId: params.id,
          role: newMessage.role,
          content: newMessage.content,
          model: newMessage.model,
          attachments: newMessage.attachments ? JSON.stringify(newMessage.attachments) : null,
        },
      });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.aIConversation.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
