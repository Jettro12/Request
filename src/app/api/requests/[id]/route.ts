import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// GET - Obtener todos los requests del usuario
export async function GET() {
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

    const requests = await prisma.request.findMany({
      where: {
        OR: [{ fromUserId: currentUser.id }, { toUserId: currentUser.id }],
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            career: true,
            email: true,
            avatar: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            career: true,
            email: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
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

// POST - Crear nuevo request
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const {
      toUserId,
      type = "COLLABORATION",
      message = "",
    } = await request.json();

    if (!toUserId) {
      return NextResponse.json(
        { error: "ID del usuario destino requerido" },
        { status: 400 }
      );
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

    // Verificar que no es el mismo usuario
    if (currentUser.id === toUserId) {
      return NextResponse.json(
        { error: "No puedes enviarte un request a ti mismo" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un request ACTIVO entre estos usuarios
    const existingActiveRequest = await prisma.request.findFirst({
      where: {
        OR: [
          {
            fromUserId: currentUser.id,
            toUserId: toUserId,
            status: { in: ["PENDING", "ACCEPTED"] },
          },
          {
            fromUserId: toUserId,
            toUserId: currentUser.id,
            status: { in: ["PENDING", "ACCEPTED"] },
          },
        ],
      },
    });

    if (existingActiveRequest) {
      return NextResponse.json(
        {
          error: "Ya existe una conversación activa con este usuario",
          existingRequest: existingActiveRequest,
        },
        { status: 409 }
      );
    }

    // Crear nuevo request
    const newRequest = await prisma.request.create({
      data: {
        fromUserId: currentUser.id,
        toUserId: toUserId,
        type: type,
        message: message,
        status: "PENDING",
      },
      include: {
        toUser: {
          select: {
            id: true,
            name: true,
            career: true,
            avatar: true,
          },
        },
        fromUser: {
          select: {
            id: true,
            name: true,
            career: true,
            avatar: true,
          },
        },
      },
    });

    console.log("✅ Nuevo request creado:", {
      id: newRequest.id,
      from: newRequest.fromUser.name,
      to: newRequest.toUser.name,
      status: newRequest.status,
    });

    return NextResponse.json({
      success: true,
      request: newRequest,
    });
  } catch (error: any) {
    console.error("Error creando request:", error);

    // Manejar error de constraint única de Prisma
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe una solicitud activa con este usuario" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar request (aceptar/rechazar/completar)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { status, rating, review } = await request.json();

    const { id: requestId } = await params;

    if (!requestId) {
      return NextResponse.json(
        { error: "ID del request no proporcionado" },
        { status: 400 }
      );
    }

    // Validar status
    if (!["ACCEPTED", "REJECTED", "COMPLETED"].includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
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

    // Buscar el request
    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        toUser: true,
        fromUser: true,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Request no encontrado" },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateData: any = { status };

    // Si se está completando y hay rating/review, agregarlos
    if (status === "COMPLETED") {
      updateData.completedAt = new Date();

      // Determinar si el usuario actual es el fromUser o toUser para asignar rating/review
      const isFromUser = existingRequest.fromUserId === currentUser.id;

      if (rating !== undefined) {
        updateData[isFromUser ? "fromUserRating" : "toUserRating"] = rating;
      }
      if (review) {
        updateData[isFromUser ? "fromUserReview" : "toUserReview"] = review;
      }
    }

    // Verificar permisos basado en el estado
    if (status === "ACCEPTED" || status === "REJECTED") {
      // Solo el receptor puede aceptar/rechazar
      if (existingRequest.toUserId !== currentUser.id) {
        return NextResponse.json(
          { error: "No tienes permiso para modificar este request" },
          { status: 403 }
        );
      }
    } else if (status === "COMPLETED") {
      // Cualquiera de los dos usuarios puede marcar como completado
      if (
        existingRequest.fromUserId !== currentUser.id &&
        existingRequest.toUserId !== currentUser.id
      ) {
        return NextResponse.json(
          { error: "No tienes permiso para modificar este request" },
          { status: 403 }
        );
      }
    }

    // Actualizar el request
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: updateData,
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            career: true,
            avatar: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            career: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error actualizando request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PATCH - Similar a PUT pero para actualizaciones parciales
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id: requestId } = await params;

    if (!requestId) {
      return NextResponse.json(
        { error: "ID del request no proporcionado" },
        { status: 400 }
      );
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

    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Request no encontrado" },
        { status: 404 }
      );
    }

    // Verificar permisos (solo usuarios involucrados)
    if (
      existingRequest.fromUserId !== currentUser.id &&
      existingRequest.toUserId !== currentUser.id
    ) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar este request" },
        { status: 403 }
      );
    }

    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: body,
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            career: true,
            avatar: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            career: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error actualizando request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
