import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
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

    // Obtener las últimas conversaciones
    const conversations = await prisma.message.findMany({
      where: {
        OR: [{ senderId: currentUser.id }, { receiverId: currentUser.id }],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            career: true,
            semester: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            career: true,
            semester: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      distinct: ["senderId", "receiverId"],
    });

    // Procesar para obtener conversaciones únicas
    const uniqueConversations = conversations.reduce((acc, message) => {
      const otherUser =
        message.senderId === currentUser.id ? message.receiver : message.sender;

      // SOLUCIÓN: Comparar strings en lugar de usar Math.min/Math.max
      const conversationKey =
        message.senderId < message.receiverId
          ? `${message.senderId}-${message.receiverId}`
          : `${message.receiverId}-${message.senderId}`;

      if (!acc.has(conversationKey)) {
        acc.set(conversationKey, {
          otherUser,
          lastMessage: message,
          unreadCount: 0, // Podrías calcular esto
        });
      }

      return acc;
    }, new Map());

    return NextResponse.json({
      conversations: Array.from(uniqueConversations.values()),
    });
  } catch (error) {
    console.error("Error obteniendo conversaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
