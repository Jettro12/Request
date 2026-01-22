import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { initKafka, startConsumerLoop } from "./kafka";
import { prisma } from "./prisma";
import {
  sendNotification,
  getUserNotifications,
  markAllAsRead,
  markAsRead,
} from "./controllers/notificationsController";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4001");
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
  }),
);

app.use(express.json());

// RUTA RAÍZ
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "notification-service" });
});

// RUTAS DE LA API (Asegúrate de que Nginx use el rewrite /api/notifications/)
app.post("/", sendNotification);
app.get("/list", getUserNotifications); // Cambiado a /list para evitar choque con GET /
app.patch("/read-all", markAllAsRead);
app.patch("/:id", markAsRead);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "notification-service",
    db: prisma ? "ok" : "unknown",
  });
});

const server = http.createServer(app);
const io = new IOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Estado global para evitar que Kafka se reinicie infinitamente si ya está corriendo
let isConsumerRunning = false;

io.on("connection", (socket) => {
  socket.on("join", (userId: string) => {
    console.log(`👤 User ${userId} connected to notifications socket`);
    socket.join(userId);
  });
});

async function start() {
  try {
    // 1. Conectar Base de Datos
    await prisma.$connect();
    console.log("✅ Notifications DB Connected");

    // 2. Iniciar Kafka
    await initKafka();
    console.log("✅ Kafka Initialized");

    // 3. Iniciar el bucle de consumo solo si no está activo
    if (!isConsumerRunning) {
      isConsumerRunning = true;
      await startConsumerLoop(
        async ({
          topic,
          message,
        }: {
          topic: string;
          partition: number;
          message: any;
        }) => {
          try {
            if (!message.value) return;

            const event = JSON.parse(message.value.toString());

            // Si el evento viene de otros servicios avisando de algo nuevo
            if (event.action === "create" || event.notification) {
              const payload = event.notification || event.post || event;

              // Emitir vía Socket.io al usuario específico
              if (payload.userId || payload.authorId) {
                const targetId = payload.userId || payload.authorId;
                io.to(targetId).emit("new-notification", payload);
              }
            }
          } catch (err) {
            console.error("❌ Error parsing Kafka message:", err);
          }
        },
      );
      console.log("🚀 Kafka Consumer Loop started");
    }

    server.listen(PORT, "0.0.0.0", () =>
      console.log(`🔔 Notification service listening on ${PORT}`),
    );
  } catch (error) {
    console.error("❌ Failed to start notification-service:", error);
    isConsumerRunning = false;
    process.exit(1);
  }
}

start();
