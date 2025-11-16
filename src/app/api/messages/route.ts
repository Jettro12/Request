import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

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

    // ⭐ CREAR NOTIFICACIÓN para el receptor
    await createNotification({
      type: "NEW_MESSAGE",
      userId: receiverId, // El que recibe el mensaje
      title: "Nuevo mensaje",
      message: `${currentUser.name} te envió un mensaje: "${content.substring(
        0,
        50
      )}..."`,
      relatedId: message.id,
    });

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
