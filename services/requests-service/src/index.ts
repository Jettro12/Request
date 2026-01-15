import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";
import {
  createRequest,
  getUserRequests,
  updateRequestStatus,
  completeRequest,
  getRequestByChat,
} from "./controllers/requestsController";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4003");
const app = express();

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

/**
 * 🚀 RUTA RAÍZ (Soporta POST desde ApiClient.requests.createRequest)
 */
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "requests-service" });
});

// POST / -> Crea una nueva solicitud
app.post("/", createRequest);

/**
 * RUTAS DE SOLICITUDES
 */

// Obtener solicitudes por usuario
app.get("/user/:userId", getUserRequests);

// Actualizar estado (Aceptar/Rechazar)
app.put("/:id/status", updateRequestStatus);

// Finalizar solicitud (Marcar como completada)
app.post("/:id/complete", completeRequest);

// Buscar solicitud ligada a un chat
app.get("/chat/:userId", getRequestByChat);

/**
 * HEALTH
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "requests-service" });
});

async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Requests Service: Prisma connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Requests service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Database connection failed", err);
    process.exit(1);
  }
}

start();
