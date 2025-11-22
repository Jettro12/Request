import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { producer } from "@/lib/kafka";

// PATCH /api/notifications/[id] - Marcar una notificación como leída
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: notificationId } = await params;

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que la notificación pertenece al usuario
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: currentUser.id,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    // Marcar como leída
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    // Publicar evento en Kafka
    await producer.send({
      topic: "notifications",
      messages: [
        {
          key: "update",
          value: JSON.stringify({
            action: "update",
            notificationId,
            userId: currentUser.id,
            read: true,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Error marcando notificación como leída:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET /api/notifications/[id] - Obtener una notificación específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: notificationId } = await params;

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: currentUser.id,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Error obteniendo notificación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Eliminar una notificación
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: notificationId } = await params;

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que la notificación pertenece al usuario
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: currentUser.id,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la notificación
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    // Publicar evento en Kafka
    await producer.send({
      topic: "notifications",
      messages: [
        {
          key: "delete",
          value: JSON.stringify({
            action: "delete",
            notificationId,
            userId: currentUser.id,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Notificación eliminada correctamente",
    });
  } catch (error) {
    console.error("Error eliminando notificación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
