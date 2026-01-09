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
      "http://localhost:8080",
      "http://frontend:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// 👇 RUTAS ALINEADAS CON NGINX 👇
// NGINX rewrite: /notifications → / (antes de pasar al servicio)
// Por lo tanto, las rutas deben ser RAÍZ (/)

// routes
app.post("/", sendNotification);
app.get("/", getUserNotifications);
app.patch("/", markAllAsRead);
app.patch("/:id", markAsRead);

// health
app.get("/health", (_req, res) => {
  // Basic health: HTTP server + optional quick checks (DB) could be added here
  const dbState = prisma ? "ok" : "unknown";
  res.json({ status: "ok", service: "notification-service", db: dbState });
});

const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: "*" } });

// Socket.io connection
io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);
  // client should join a room with their userId
  socket.on("join", (userId: string) => {
    socket.join(userId);
    console.log("Socket joined room", userId);
  });
});

// Start
async function start() {
  try {
    // Start HTTP server immediately so /health responds even if DB/Kafka are not ready
    server.listen(PORT, "0.0.0.0", () =>
      console.log(`Notification service listening on ${PORT}`)
    );

    // Connect prisma (optional warmup) with retries so startup is resilient
    const maxDbRetries = 8;
    let dbAttempt = 0;
    while (dbAttempt < maxDbRetries) {
      try {
        await prisma.$connect();
        console.log("Prisma connected to database");
        break;
      } catch (err) {
        dbAttempt++;
        console.warn(
          `Prisma connect attempt ${dbAttempt} failed: ${err}. Retrying in 2s...`
        );
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // Init Kafka and subscribe (initKafka has its own retries)
    await initKafka();

    // Start resilient consumer loop (runs in background)
    startConsumerLoop(async ({ topic, partition, message }) => {
      try {
        if (!message?.value) return;
        const event = JSON.parse(message.value.toString());
        if (event.action === "create" && event.notification) {
          io.to(event.notification.userId).emit(
            "new-notification",
            event.notification
          );
          console.log("Emitted new-notification to", event.notification.userId);
        }
      } catch (err) {
        console.error("Error handling kafka message", err);
      }
    }).catch((err) => console.error("Consumer loop error", err));
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();
