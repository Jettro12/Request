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
  })
);

app.use(express.json());

// RUTA RAÍZ PARA EVITAR 404
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "notification-service" });
});

app.post("/", sendNotification);
app.get("/", getUserNotifications);
app.patch("/", markAllAsRead);
app.patch("/:id", markAsRead);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "notification-service",
    db: prisma ? "ok" : "unknown",
  });
});

const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("join", (userId: string) => {
    socket.join(userId);
  });
});

async function start() {
  try {
    server.listen(PORT, "0.0.0.0", () =>
      console.log(`Notification service listening on ${PORT}`)
    );

    await prisma.$connect();
    await initKafka();

    // 🔥 CORRECCIÓN DEL ERROR DE COMPILACIÓN 🔥
    // Tipamos explícitamente el objeto que viene de Kafka
    await startConsumerLoop(
      async ({
        topic,
        partition,
        message,
      }: {
        topic: string;
        partition: number;
        message: any;
      }) => {
        try {
          if (!message.value) return;

          const event = JSON.parse(message.value.toString());

          if (event.action === "create" && event.notification) {
            io.to(event.notification.userId).emit(
              "new-notification",
              event.notification
            );
          }
        } catch (err) {
          console.error("Error handling kafka message", err);
        }
      }
    );
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();
