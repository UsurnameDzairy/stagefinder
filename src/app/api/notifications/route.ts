import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Récupérer les notifications de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        alert: {
          select: { name: true },
        },
      },
    });

    // Compter les non lues
    const unreadCount = await prisma.notification.count({
      where: { userId: session.id, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// POST - Marquer des notifications comme lues
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, notificationIds } = body;

    if (action === "markRead") {
      if (notificationIds && Array.isArray(notificationIds)) {
        // Marquer des notifications spécifiques comme lues
        await prisma.notification.updateMany({
          where: {
            id: { in: notificationIds },
            userId: session.id,
          },
          data: { isRead: true },
        });
      } else {
        // Marquer toutes comme lues
        await prisma.notification.updateMany({
          where: { userId: session.id, isRead: false },
          data: { isRead: true },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "markAllRead") {
      await prisma.notification.updateMany({
        where: { userId: session.id },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

// DELETE - Supprimer des notifications
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");
    const deleteAll = searchParams.get("all") === "true";

    if (deleteAll) {
      await prisma.notification.deleteMany({
        where: { userId: session.id },
      });
    } else if (notificationId) {
      await prisma.notification.delete({
        where: { id: notificationId, userId: session.id },
      });
    } else {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500 });
  }
}
