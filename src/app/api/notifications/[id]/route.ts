import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { markNotificationAsRead } from "@/lib/notifications";
import { prisma } from "@/lib/db";

// PATCH /api/notifications/[id] - Marcar una notificación como leída
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: notificationId } = await params;

    const notification = await markNotificationAsRead(notificationId);

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error marcando notificación como leída:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
