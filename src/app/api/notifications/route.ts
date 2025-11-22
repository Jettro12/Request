import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { producer } from "@/lib/kafka";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el usuario actual
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Construir where clause
    const where: any = {
      userId: currentUser.id,
    };

    if (unreadOnly) {
      where.read = false;
    }

    // Obtener notificaciones
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error obteniendo notificaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, message, relatedId, targetUsers, targetCareer } = body;

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Determinar los usuarios destinatarios
    let userIds: string[] = [];

    if (targetUsers && targetUsers.length > 0) {
      // Notificación para usuarios específicos
      userIds = targetUsers;
    } else if (targetCareer) {
      // Notificación para todos los usuarios de una carrera
      const usersInCareer = await prisma.user.findMany({
        where: { career: targetCareer },
        select: { id: true },
      });
      userIds = usersInCareer.map((user) => user.id);

      // Excluir al usuario actual si es una notificación de su propia acción
      userIds = userIds.filter((id) => id !== currentUser.id);
    } else {
      // Notificación individual
      userIds = [currentUser.id];
    }

    // Si no hay usuarios destinatarios, retornar éxito
    if (userIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay usuarios para notificar",
        notifications: [],
      });
    }

    // Crear notificaciones para cada usuario
    const notifications = await Promise.all(
      userIds.map((userId) =>
        prisma.notification.create({
          data: {
            type,
            userId,
            title,
            message,
            relatedId,
            senderId: type !== "SYSTEM" ? currentUser.id : null,
          },
        })
      )
    );

    // Publicar eventos en Kafka para cada notificación
    await Promise.all(
      notifications.map((notification) =>
        producer.send({
          topic: "notifications",
          messages: [
            {
              key: "create",
              value: JSON.stringify({
                action: "create",
                notificationId: notification.id,
                userId: notification.userId,
                senderId: currentUser.id,
                type,
                title,
                message,
                relatedId,
                timestamp: new Date().toISOString(),
              }),
            },
          ],
        })
      )
    );

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error creando notificación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, read } = body;

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
      where: { id: notificationId, userId: currentUser.id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read },
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
            read,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    return NextResponse.json({ notification: updatedNotification });
  } catch (error) {
    console.error("Error actualizando notificación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Nuevo endpoint para marcar todas como leídas
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Marcar todas las notificaciones no leídas como leídas
    const result = await prisma.notification.updateMany({
      where: {
        userId: currentUser.id,
        read: false,
      },
      data: { read: true },
    });

    // Publicar evento en Kafka para la actualización masiva
    await producer.send({
      topic: "notifications",
      messages: [
        {
          key: "mark_all_read",
          value: JSON.stringify({
            action: "mark_all_read",
            userId: currentUser.id,
            count: result.count,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} notificaciones marcadas como leídas`,
    });
  } catch (error) {
    console.error("Error marcando notificaciones como leídas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
