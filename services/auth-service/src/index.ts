import bcrypt from "bcryptjs";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client"; // Necesario para identificar tipos de error

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
// REGISTER ROUTE (CORREGIDA)
// ==========================================
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "missing" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
    });

    // Intentar crear perfil en users-service para mantener datos sincronizados
    // No abortar el registro si la creación del perfil falla.
    (async () => {
      try {
        const USERS_SERVICE_URL =
          process.env.INTERNAL_USERS_SERVICE_URL || "http://users-service:4007";
        await fetch(`${USERS_SERVICE_URL}/profile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            name: user.name,
            email: user.email,
          }),
        });
      } catch (err) {
        console.warn("Could not create profile in users-service:", err);
      }
    })();

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    // Manejo específico de errores de Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002: Unique constraint failed (Email duplicado)
      if (error.code === "P2002") {
        return res.status(409).json({ error: "El email ya está registrado" });
      }
    }

    console.error("Error en register:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================================
// LOGIN ROUTE (CON SEGURIDAD)
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

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "invalid" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================================
// LOGOUT ROUTE
// ==========================================
app.post("/logout", async (req, res) => {
  // En un sistema JWT, el logout generalmente es manejado en el cliente
  // eliminando el token. Este endpoint existe para compatibilidad.
  res.json({ success: true, message: "Logged out successfully" });
});

app.get("/health", (_req, res) => {
  const dbState = prisma ? "ok" : "unknown";
  res.json({ status: "ok", service: "auth-service", db: dbState });
});

async function start() {
  serverListen();

  // prisma warmup with retries
  const maxDbRetries = 8;
  let dbAttempt = 0;
  while (dbAttempt < maxDbRetries) {
    try {
      await prisma.$connect();
      console.log("Auth prisma connected");
      break;
    } catch (err) {
      dbAttempt++;
      console.warn(
        `Prisma connect attempt ${dbAttempt} failed: ${err}. Retrying in 2s...`
      );
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

function serverListen() {
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`Auth service listening on ${PORT}`)
  );
}

start().catch((err) => {
  console.error("Failed to start auth-service", err);
  process.exit(1);
});
