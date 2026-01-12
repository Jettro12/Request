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

// 🛡️ CORS
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

/* =====================================================
   HEALTH
===================================================== */
app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "users-service" })
);

/* =====================================================
   USERS ROUTES (SIN PREFIJO /users)
   El Proxy ya se encarga de dirigir aquí cuando llaman a /users
===================================================== */

// 1. Búsquedas específicas (Deben ir antes de /:id)
// Frontend: /users/search -> Backend: /search
app.get("/search", searchUsers);

// Frontend: /users/career/:career -> Backend: /career/:career
app.get("/career/:career", getUsersByCareer);

// 2. Gestión de Perfil
// Frontend: /users/profile -> Backend: /profile
app.post("/profile", createProfile);

// Frontend: /users/:id/profile -> Backend: /:id/profile
app.put("/:id/profile", updateProfile);

// 3. Obtener por ID (Genérico, va al final)
// Frontend: /users/:id -> Backend: /:id
app.get("/:id", getUserProfile);

/* =====================================================
   START
===================================================== */
async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to users database");

    const userService = new UserService(prisma);
    console.log("✅ UserService initialized");

    if (eventConsumer?.startConsuming) {
      try {
        await eventConsumer.startConsuming(userService);
        console.log("✅ RabbitMQ consumer started");
      } catch (err: any) {
        console.warn("⚠️ RabbitMQ consumer not running:", err.message);
      }
    }

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Users service listening on ${PORT}`)
    );
  } catch (error) {
    console.error("❌ Failed to start users-service:", error);
    process.exit(1);
  }
}

start();
