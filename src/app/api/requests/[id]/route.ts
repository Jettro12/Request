// src/app/api/requests/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// GET - Obtener un request específico por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: requestId } = await params;

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            career: true,
            email: true,
            avatar: true,
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
            email: true,
            avatar: true,
            semester: true,
            rating: true,
            skills: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Request no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario tiene acceso a este request
    if (
      request.fromUserId !== currentUser.id &&
      request.toUserId !== currentUser.id
    ) {
      return NextResponse.json(
        { error: "No tienes acceso a este request" },
        { status: 403 }
      );
    }

    return NextResponse.json({ request });
  } catch (error) {
    console.error("Error obteniendo request:", error);
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

    // 🔔 CREAR NOTIFICACIONES según la acción
    if (status === "ACCEPTED") {
      await createNotification({
        type: "REQUEST_ACCEPTED",
        userId: existingRequest.fromUserId,
        title: "Solicitud aceptada",
        message: `${currentUser.name} aceptó tu solicitud de ${existingRequest.type}`,
        relatedId: requestId,
      });
    } else if (status === "REJECTED") {
      await createNotification({
        type: "REQUEST_REJECTED",
        userId: existingRequest.fromUserId,
        title: "Solicitud rechazada",
        message: `${currentUser.name} rechazó tu solicitud de ${existingRequest.type}`,
        relatedId: requestId,
      });
    } else if (status === "COMPLETED") {
      await createNotification({
        type: "PROJECT_COMPLETED",
        userId:
          existingRequest.fromUserId === currentUser.id
            ? existingRequest.toUserId
            : existingRequest.fromUserId,
        title: "Proyecto completado",
        message: `${currentUser.name} marcó el proyecto como completado`,
        relatedId: requestId,
      });
    }

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

// DELETE - Eliminar request
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: requestId } = await params;

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

    // Solo el creador puede eliminar el request
    if (existingRequest.fromUserId !== currentUser.id) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este request" },
        { status: 403 }
      );
    }

    await prisma.request.delete({
      where: { id: requestId },
    });

    return NextResponse.json({
      success: true,
      message: "Request eliminado correctamente",
    });
  } catch (error) {
    console.error("Error eliminando request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
