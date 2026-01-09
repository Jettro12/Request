import { eventConsumer } from "./events/consumer";
import UserService from "./services/userService";
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

dotenv.config();

const PORT = parseInt(process.env.PORT || "4007");
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

// Rutas
app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "users-service" })
);

app.get("/search", searchUsers);
app.get("/career/:career", getUsersByCareer);
app.post("/profile", createProfile);
app.put("/:id/profile", updateProfile);
app.get("/:id", getUserProfile);

async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to usersdb");

    // Crear instancia de UserService
    const userService = new UserService(prisma);
    console.log("✅ UserService initialized");

    // Iniciar RabbitMQ consumer si está disponible
    if (eventConsumer && typeof eventConsumer.startConsuming === "function") {
      try {
        await eventConsumer.startConsuming(userService);
        console.log("✅ RabbitMQ consumer started");
      } catch (error: any) {
        console.log("⚠️  RabbitMQ consumer failed:", error.message);
      }
    } else {
      console.log("⚠️  Running without RabbitMQ event sync");
    }

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Users service listening on port ${PORT}`)
    );
  } catch (error: any) {
    console.error("❌ Failed to start users-service:", error);
    process.exit(1);
  }
}

start();
