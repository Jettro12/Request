// src/app/api/users/route.ts
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const career = searchParams.get("career");
    const skills = searchParams.get("skills");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        { skills: { hasSome: [search] } },
        { interests: { hasSome: [search] } },
      ];
    }

    if (career && career !== "Todos los espacios") {
      where.career = career;
    }

    if (skills) {
      where.skills = { hasSome: skills.split(",") };
    }

    // Excluir al usuario actual
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (currentUser) {
      where.NOT = { id: currentUser.id };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        career: true,
        semester: true,
        bio: true,
        skills: true,
        interests: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
      },
      orderBy: {
        rating: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error buscando usuarios:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
