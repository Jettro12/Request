import bcrypt from "bcryptjs";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4004");
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://localhost:8080",
      "http://frontend:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ==========================================
// REGISTER ROUTE (OPTIMIZADA PARA DB COMPARTIDA)
// ==========================================
app.post("/register", async (req, res) => {
  // 1. Recibimos TODOS los datos del frontend
  const { name, email, password, career, semester, bio, skills, interests } =
    req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    // 2. Guardamos TODO de una sola vez (Auth + Perfil)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        career, // ✅ Guardamos carrera directamente
        semester, // ✅ Guardamos semestre directamente
        bio, // ✅ Guardamos bio directamente
        skills: skills || [],
        interests: interests || [],
      },
    });

    // 3. 🚀 ELIMINADO: Ya NO llamamos a users-service/profile.
    // Como la DB es compartida, el users-service ya puede "ver"
    // estos datos inmediatamente sin hacer nada extra.

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({ error: "El email ya está registrado" });
      }
    }
    console.error("Error en register:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================================
// LOGIN ROUTE
// ==========================================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "missing" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "invalid" });
    }

    const isValid = await bcrypt.compare(password, user.password || "");
    if (!isValid) {
      return res.status(401).json({ error: "invalid" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        career: user.career, // Opcional: devolver más datos al login
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.post("/logout", async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

app.get("/health", (_req, res) => {
  const dbState = prisma ? "ok" : "unknown";
  res.json({ status: "ok", service: "auth-service", db: dbState });
});

async function start() {
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`Auth service listening on ${PORT}`)
  );

  // prisma warmup
  const maxDbRetries = 8;
  let dbAttempt = 0;
  while (dbAttempt < maxDbRetries) {
    try {
      await prisma.$connect();
      console.log("Auth prisma connected");
      break;
    } catch (err) {
      dbAttempt++;
      console.warn(`Prisma connect retry ${dbAttempt}...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

start().catch((err) => {
  console.error("Failed to start auth-service", err);
  process.exit(1);
});
