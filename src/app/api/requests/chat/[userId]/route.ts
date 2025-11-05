import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { userId: otherUserId } = await params;

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

    // Buscar el request entre estos usuarios
    const request = await prisma.request.findFirst({
      where: {
        OR: [
          {
            fromUserId: currentUser.id,
            toUserId: otherUserId,
          },
          {
            fromUserId: otherUserId,
            toUserId: currentUser.id,
          },
        ],
      },
      select: {
        id: true,
        status: true,
        fromUserRating: true,
        toUserRating: true,
        fromUserReview: true,
        toUserReview: true,
        completedAt: true,
      },
    });

    return NextResponse.json({ request });
  } catch (error) {
    console.error("Error obteniendo request del chat:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
