import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { content, receiverId } = await request.json();

    if (!content || !receiverId) {
      return NextResponse.json(
        { error: "Contenido y receptor son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el receptor existe
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Usuario receptor no encontrado" },
        { status: 404 }
      );
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

    // Crear el mensaje
    const message = await prisma.message.create({
      data: {
        content,
        senderId: currentUser.id,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            career: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            career: true,
          },
        },
      },
    });

    // ✅ CREAR NOTIFICACIÓN usando URL relativa
    try {
      const notificationResponse = await fetch(
        `${request.headers.get("origin") || ""}/api/notifications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "NEW_MESSAGE",
            title: "Nuevo mensaje",
            message: `${
              currentUser.name
            } te envió un mensaje: "${content.substring(0, 50)}..."`,
            relatedId: message.id,
            targetUsers: [receiverId],
            senderId: currentUser.id,
          }),
        }
      );

      if (!notificationResponse.ok) {
        console.error(
          "Error creando notificación:",
          await notificationResponse.text()
        );
      } else {
        console.log("✅ Notificación de mensaje creada");
      }
    } catch (notificationError) {
      console.error("Error en fetch de notificación:", notificationError);
      // No fallar la operación principal si la notificación falla
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error enviando mensaje:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("otherUserId");

    if (!otherUserId) {
      return NextResponse.json(
        { error: "ID del otro usuario es requerido" },
        { status: 400 }
      );
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

    // Obtener mensajes entre los dos usuarios
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: currentUser.id,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: currentUser.id,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            career: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            career: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error obteniendo mensajes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
