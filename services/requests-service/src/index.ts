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

/* =====================================================
   RUTAS DEL MICROSERVICIO (Sin prefijo /requests)
===================================================== */

// ✅ RUTA RAÍZ (GET /): Informativa
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "requests-service",
    description: "Handles help requests",
  });
});

// ✅ RUTA RAÍZ (POST /): Crea una nueva solicitud
app.post("/", createRequest);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "requests-service" });
});

// Rutas funcionales
app.get("/user/:userId", getUserRequests);
app.get("/chat/:userId", getRequestByChat);
app.post("/:id/complete", completeRequest);
app.put("/:id/status", updateRequestStatus);

async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Requests DB Connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Requests service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Database connection failed", err);
    process.exit(1);
  }
}

start();
