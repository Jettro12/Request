import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// GET: Obtener requests del usuario (recibidos y enviados)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'received' | 'sent'

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    let whereCondition = {};

    if (type === "received") {
      whereCondition = { toUserId: user.id };
    } else if (type === "sent") {
      whereCondition = { fromUserId: user.id };
    } else {
      // Por defecto, mostrar ambos
      whereCondition = {
        OR: [{ toUserId: user.id }, { fromUserId: user.id }],
      };
    }

    const requests = await prisma.request.findMany({
      where: whereCondition,
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            career: true,
            semester: true,
            rating: true,
            skills: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            career: true,
            semester: true,
            rating: true,
            skills: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          take: 1, // Solo el último mensaje para preview
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error obteniendo requests:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST: Enviar nuevo request
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { toUserId, message, type } = await request.json();

    // Validaciones
    if (!toUserId || !message || !type) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Obtener usuario actual
    const fromUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!fromUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que no existe un request pendiente entre estos usuarios
    const existingRequest = await prisma.request.findFirst({
      where: {
        fromUserId: fromUser.id,
        toUserId: toUserId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "Ya has enviado una solicitud a este usuario" },
        { status: 400 }
      );
    }

    // Verificar que no es el mismo usuario
    if (fromUser.id === toUserId) {
      return NextResponse.json(
        { error: "No puedes enviarte una solicitud a ti mismo" },
        { status: 400 }
      );
    }

    // Crear request
    const newRequest = await prisma.request.create({
      data: {
        type: type.toUpperCase(),
        message,
        fromUserId: fromUser.id,
        toUserId: toUserId,
        // Crear también el primer mensaje
        messages: {
          create: {
            content: message,
            senderId: fromUser.id,
            receiverId: toUserId,
          },
        },
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            career: true,
            semester: true,
            rating: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            career: true,
            semester: true,
            rating: true,
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
            type: "REQUEST_RECEIVED",
            title: "Nueva solicitud recibida",
            message: `${fromUser.name} te envió una solicitud de ${type}`,
            relatedId: newRequest.id,
            targetUsers: [toUserId],
            senderId: fromUser.id,
          }),
        }
      );

      if (!notificationResponse.ok) {
        console.error(
          "Error creando notificación:",
          await notificationResponse.text()
        );
      } else {
        console.log("✅ Notificación de solicitud creada");
      }
    } catch (notificationError) {
      console.error("Error en fetch de notificación:", notificationError);
      // No fallar la operación principal si la notificación falla
    }

    return NextResponse.json(
      {
        message: "Solicitud enviada exitosamente",
        request: newRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
