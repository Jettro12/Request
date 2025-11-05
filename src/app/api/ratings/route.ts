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

    const { ratedUserId, rating, requestId } = await request.json();

    console.log("📝 Recibiendo calificación:", {
      ratedUserId,
      rating,
      requestId,
      sessionEmail: session.user.email,
    });

    // Validaciones
    if (!ratedUserId || !rating || !requestId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: ratedUserId, rating, requestId" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "La calificación debe ser entre 1 y 5" },
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

    // Buscar el request para verificar permisos
    const requestRecord = await prisma.request.findFirst({
      where: {
        id: requestId,
        OR: [
          { fromUserId: currentUser.id, toUserId: ratedUserId },
          { fromUserId: ratedUserId, toUserId: currentUser.id },
        ],
        status: "COMPLETED",
      },
    });

    if (!requestRecord) {
      return NextResponse.json(
        { error: "Request no encontrado o no completado" },
        { status: 404 }
      );
    }

    // Determinar qué campo actualizar
    const isFromUser = requestRecord.fromUserId === currentUser.id;
    const updateData = isFromUser
      ? { fromUserRating: rating }
      : { toUserRating: rating };

    // Actualizar el request con la calificación
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: updateData,
    });

    console.log("✅ Calificación guardada:", {
      requestId: updatedRequest.id,
      rating: rating,
      field: isFromUser ? "fromUserRating" : "toUserRating",
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("❌ Error guardando rating:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Para debugging de ratings
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

    // Obtener requests completados con ratings
    const ratedRequests = await prisma.request.findMany({
      where: {
        AND: [
          {
            OR: [{ fromUserId: currentUser.id }, { toUserId: currentUser.id }],
          },
          {
            status: "COMPLETED",
          },
          {
            OR: [
              { fromUserRating: { not: null } },
              { toUserRating: { not: null } },
            ],
          },
        ],
      },
      include: {
        fromUser: { select: { name: true } },
        toUser: { select: { name: true } },
      },
    });

    return NextResponse.json({ ratedRequests });
  } catch (error) {
    console.error("Error obteniendo ratings:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
