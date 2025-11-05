import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log("🔍 [DEBUG] Sesión:", session?.user?.email);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { rating, review } = await request.json();
    const { id: requestId } = await params;

    console.log("🔍 [DEBUG] Request ID:", requestId);
    console.log("🔍 [DEBUG] Rating:", rating);
    console.log("🔍 [DEBUG] Review:", review);

    if (!requestId) {
      console.log("❌ [DEBUG] Falta requestId");
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

    console.log("🔍 [DEBUG] Usuario actual:", currentUser?.id);

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

    console.log("🔍 [DEBUG] Request encontrado:", {
      id: existingRequest?.id,
      status: existingRequest?.status,
      fromUserId: existingRequest?.fromUserId,
      toUserId: existingRequest?.toUserId,
      fromUserRating: existingRequest?.fromUserRating,
      toUserRating: existingRequest?.toUserRating,
    });

    if (!existingRequest) {
      console.log("❌ [DEBUG] Request no existe");
      return NextResponse.json(
        { error: "Request no encontrado" },
        { status: 404 }
      );
    }

    // VERIFICACIÓN MODIFICADA: Permitir múltiples estados para calificación
    const ratableStatuses = [
      "ACCEPTED",
      "AGREEMENT_ACCEPTED",
      "PENDING_RATING",
      "COMPLETED",
    ];

    console.log(
      "🔍 [DEBUG] Estado actual del request:",
      existingRequest.status
    );
    console.log("🔍 [DEBUG] Estados permitidos:", ratableStatuses);

    if (!ratableStatuses.includes(existingRequest.status)) {
      console.log(
        "❌ [DEBUG] Estado inválido para calificar:",
        existingRequest.status
      );
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

    console.log("🔍 [DEBUG] Relación usuario-request:", {
      currentUserId: currentUser.id,
      fromUserId: existingRequest.fromUserId,
      toUserId: existingRequest.toUserId,
      isFromUser,
      isToUser,
    });

    if (!isFromUser && !isToUser) {
      console.log("❌ [DEBUG] Usuario no tiene permisos para calificar");
      return NextResponse.json(
        { error: "No tienes permiso para calificar este request" },
        { status: 403 }
      );
    }

    // VERIFICAR SI EL USUARIO YA CALIFICÓ - Evita múltiples calificaciones
    if (isFromUser && existingRequest.fromUserRating !== null) {
      console.log(
        "❌ [DEBUG] Usuario from ya calificó:",
        existingRequest.fromUserRating
      );
      return NextResponse.json(
        { error: "Ya has calificado este request" },
        { status: 400 }
      );
    }

    if (isToUser && existingRequest.toUserRating !== null) {
      console.log(
        "❌ [DEBUG] Usuario to ya calificó:",
        existingRequest.toUserRating
      );
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
      console.log("🔍 [DEBUG] Actualizando calificación de fromUser");
    } else {
      updateData.toUserRating = rating;
      updateData.toUserReview = review || null;
      console.log("🔍 [DEBUG] Actualizando calificación de toUser");
    }

    // Verificar si AMBAS partes ya calificaron
    const willBothRated =
      (isFromUser && existingRequest.toUserRating !== null) ||
      (isToUser && existingRequest.fromUserRating !== null);

    console.log("🔍 [DEBUG] Ambas partes calificaron?:", willBothRated);
    console.log(
      "🔍 [DEBUG] Calificación existente from:",
      existingRequest.fromUserRating
    );
    console.log(
      "🔍 [DEBUG] Calificación existente to:",
      existingRequest.toUserRating
    );

    if (willBothRated) {
      updateData.status = "COMPLETED";
      updateData.completedAt = new Date();
      console.log("🔍 [DEBUG] Marcando request como COMPLETED");
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

    console.log("🔍 [DEBUG] Request actualizado exitosamente");

    // Si ambas partes calificaron, actualizar ratings de usuarios
    if (willBothRated) {
      console.log("🔍 [DEBUG] Actualizando ratings de ambos usuarios");
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
    console.error("❌ [DEBUG] Error completando request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Función para actualizar ratings de usuarios - MEJORADA
async function updateUserRatings(userId: string) {
  try {
    console.log("🔍 [DEBUG] Actualizando rating para usuario:", userId);

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

    console.log(
      "🔍 [DEBUG] Requests encontrados para calificación:",
      userRequests.length
    );

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

    console.log("🔍 [DEBUG] Stats calculados:", {
      totalRating,
      ratingCount,
      averageRating,
    });

    // Actualizar usuario
    await prisma.user.update({
      where: { id: userId },
      data: {
        rating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
        reviewCount: ratingCount,
      },
    });

    console.log(
      `✅ [DEBUG] Usuario ${userId} actualizado: Rating ${averageRating}, Count ${ratingCount}`
    );
  } catch (error) {
    console.error("❌ [DEBUG] Error actualizando ratings del usuario:", error);
    throw error;
  }
}
