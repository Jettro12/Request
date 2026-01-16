import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";
import {
  getUserProfile,
  searchUsers,
  updateProfile,
  createProfile,
  getUsersByCareer,
} from "./controllers/usersController";
import { eventConsumer } from "./events/consumer";
import UserService from "./services/userService";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4007");
const app = express();

// 🛡️ CORS optimizado para producción
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://frontend:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* =====================================================
   RUTAS RAÍZ Y SALUD (Para Nginx y AWS)
===================================================== */

// ✅ RUTA RAÍZ (Responde a /users/ cuando Nginx limpia la ruta)
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "users-service",
    message: "API is online",
  });
});

app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "users-service" })
);

/* =====================================================
   USERS ROUTES
===================================================== */

// 1. Búsquedas específicas (SIEMPRE primero para evitar colisión con :id)
app.get("/search", searchUsers);
app.get("/career/:career", getUsersByCareer);

// 2. Gestión de Perfil
app.post("/profile", createProfile);
app.put("/:id/profile", updateProfile);

// 3. Obtener por ID (Genérico, va al final)
app.get("/:id", getUserProfile);

/* =====================================================
   START LOGIC
===================================================== */
async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to users database");

    const userService = new UserService(prisma);
    console.log("✅ UserService initialized");

    // RabbitMQ consumer (si está configurado)
    if (eventConsumer?.startConsuming) {
      try {
        await eventConsumer.startConsuming(userService);
        console.log("✅ RabbitMQ consumer started");
      } catch (err: any) {
        console.warn("⚠️ RabbitMQ consumer not running:", err.message);
      }
    }

    // Escuchar en 0.0.0.0 para Docker
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Users service listening on port ${PORT}`)
    );
  } catch (error) {
    console.error("❌ Failed to start users-service:", error);
    process.exit(1);
  }
}

start();
