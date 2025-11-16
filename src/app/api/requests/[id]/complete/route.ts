import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { rating, review } = await request.json();
    const { id: requestId } = await params;

    if (!requestId) {
      return NextResponse.json(
        { error: "ID del request no proporcionado" },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "La calificación debe ser entre 1 y 5 estrellas" },
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

    // Buscar el request con información de ratings existentes
    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        fromUser: true,
        toUser: true,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Request no encontrado" },
        { status: 404 }
      );
    }

    // Estados permitidos para calificación
    const ratableStatuses = [
      "ACCEPTED",
      "AGREEMENT_ACCEPTED",
      "PENDING_RATING",
      "COMPLETED",
    ];

    if (!ratableStatuses.includes(existingRequest.status)) {
      return NextResponse.json(
        {
          error:
            "Este request no está listo para calificación. Estado actual: " +
            existingRequest.status,
        },
        { status: 400 }
      );
    }

    // Verificar que el usuario sea parte del request
    const isFromUser = existingRequest.fromUserId === currentUser.id;
    const isToUser = existingRequest.toUserId === currentUser.id;

    if (!isFromUser && !isToUser) {
      return NextResponse.json(
        { error: "No tienes permiso para calificar este request" },
        { status: 403 }
      );
    }

    // VERIFICAR SI EL USUARIO YA CALIFICÓ
    if (isFromUser && existingRequest.fromUserRating !== null) {
      return NextResponse.json(
        { error: "Ya has calificado este request" },
        { status: 400 }
      );
    }

    if (isToUser && existingRequest.toUserRating !== null) {
      return NextResponse.json(
        { error: "Ya has calificado este request" },
        { status: 400 }
      );
    }

    // Determinar qué campo actualizar
    const updateData: any = {};

    if (isFromUser) {
      updateData.fromUserRating = rating;
      updateData.fromUserReview = review || null;
    } else {
      updateData.toUserRating = rating;
      updateData.toUserReview = review || null;
    }

    // Verificar si AMBAS partes ya calificaron
    const willBothRated =
      (isFromUser && existingRequest.toUserRating !== null) ||
      (isToUser && existingRequest.fromUserRating !== null);

    if (willBothRated) {
      updateData.status = "COMPLETED";
      updateData.completedAt = new Date();
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
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            career: true,
          },
        },
      },
    });

    // 🔔 NOTIFICACIÓN: Calificación recibida
    await createNotification({
      type: "RATING_RECEIVED",
      userId: isFromUser
        ? existingRequest.toUserId
        : existingRequest.fromUserId,
      title: "Nueva calificación recibida",
      message: `${currentUser.name} te calificó con ${rating} estrellas${
        review ? `: "${review}"` : ""
      }`,
      relatedId: requestId,
    });

    // Si ambas partes calificaron, actualizar ratings de usuarios
    if (willBothRated) {
      await updateUserRatings(existingRequest.fromUserId);
      await updateUserRatings(existingRequest.toUserId);

      return NextResponse.json({
        request: updatedRequest,
        message: "¡Acuerdo completado! Ambas partes se han calificado.",
      });
    }

    return NextResponse.json({
      request: updatedRequest,
      message: "Calificación enviada. Esperando calificación de la otra parte.",
    });
  } catch (error) {
    console.error("Error completando request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Función para actualizar ratings de usuarios
async function updateUserRatings(userId: string) {
  try {
    // Obtener todas las calificaciones del usuario
    const userRequests = await prisma.request.findMany({
      where: {
        OR: [
          {
            fromUserId: userId,
            fromUserRating: { not: null },
            status: "COMPLETED",
          },
          {
            toUserId: userId,
            toUserRating: { not: null },
            status: "COMPLETED",
          },
        ],
      },
      select: {
        fromUserId: true,
        toUserId: true,
        fromUserRating: true,
        toUserRating: true,
      },
    });

    let totalRating = 0;
    let ratingCount = 0;

    userRequests.forEach((request) => {
      if (request.fromUserId === userId && request.fromUserRating) {
        totalRating += request.fromUserRating;
        ratingCount++;
      }
      if (request.toUserId === userId && request.toUserRating) {
        totalRating += request.toUserRating;
        ratingCount++;
      }
    });

    // Calcular nuevo rating promedio
    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    // Actualizar usuario
    await prisma.user.update({
      where: { id: userId },
      data: {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: ratingCount,
      },
    });
  } catch (error) {
    console.error("Error actualizando ratings del usuario:", error);
    throw error;
  }
}
