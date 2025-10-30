// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password, career, semester, bio, skills, interests } =
      await request.json();

    // Validaciones básicas
    if (!name || !email || !password || !career || !semester) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con este email" },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        career,
        semester: parseInt(semester),
        bio: bio || "",
        skills: skills || [],
        interests: interests || [],
      },
    });

    // Retornar usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "Usuario registrado exitosamente",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
