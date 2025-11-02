import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // params es una Promise
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { status } = await request.json();

    // DESEMPAQUETAR LA PROMISE CON AWAIT
    const { id: requestId } = await params;

    // Validar que requestId no sea undefined
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

    // Buscar el request
    const existingRequest = await prisma.request.findUnique({
      where: { id: requestId }, // Ahora requestId tiene un valor válido
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

    // Verificar permisos (solo el receptor puede aceptar/rechazar)
    if (existingRequest.toUserId !== currentUser.id) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar este request" },
        { status: 403 }
      );
    }

    // Actualizar el request
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: { status },
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

    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    console.error("Error actualizando request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// También actualiza la función PATCH si la tienes
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { status } = await request.json();

    // DESEMPAQUETAR LA PROMISE
    const { id: requestId } = await params;

    if (!requestId) {
      return NextResponse.json(
        { error: "ID del request no proporcionado" },
        { status: 400 }
      );
    }

    // ... resto del código igual que en PUT
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
      include: {
        toUser: true,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Request no encontrado" },
        { status: 404 }
      );
    }

    if (existingRequest.toUserId !== currentUser.id) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar este request" },
        { status: 403 }
      );
    }

    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: { status },
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

    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    console.error("Error actualizando request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
