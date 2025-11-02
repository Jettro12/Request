// src/app/api/posts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// GET: Obtener todas las publicaciones (con paginación)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const careerSpace = searchParams.get("careerSpace");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (careerSpace && careerSpace !== "Todos los espacios") {
      where.careerSpace = careerSpace;
    }

    if (type && type !== "all") {
      where.type = type.toUpperCase();
    }

    // Obtener publicaciones con información del autor
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            career: true,
            semester: true,
            rating: true,
            skills: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Obtener conteo total para paginación
    const total = await prisma.post.count({ where });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo publicaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST: Crear nueva publicación
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { title, content, type, careerSpace, skills } = await request.json();

    // Validaciones
    if (!title || !content || !type || !careerSpace) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Obtener usuario actual
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Crear publicación
    const post = await prisma.post.create({
      data: {
        title,
        content,
        type: type.toUpperCase(),
        careerSpace,
        skills: skills || [],
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            career: true,
            semester: true,
            rating: true,
            skills: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Publicación creada exitosamente",
        post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando publicación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
