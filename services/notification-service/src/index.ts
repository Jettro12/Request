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

// ================= ROUTES =================

// NGINX rewrite: /notifications → /
// Por eso las rutas son raíz
app.post("/", sendNotification);
app.get("/", getUserNotifications);
app.patch("/", markAllAsRead);
app.patch("/:id", markAsRead);

// health
app.get("/health", (_req, res) => {
  const dbState = prisma ? "ok" : "unknown";
  res.json({ status: "ok", service: "notification-service", db: dbState });
});

// ================= SOCKET.IO =================

const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);

  socket.on("join", (userId: string) => {
    socket.join(userId);
    console.log("Socket joined room", userId);
  });
});

// ================= START =================

async function start() {
  try {
    // HTTP server primero (health responde rápido)
    server.listen(PORT, "0.0.0.0", () =>
      console.log(`Notification service listening on ${PORT}`)
    );

    // Prisma con retries
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
          `Prisma connect attempt ${dbAttempt} failed. Retrying in 2s...`
        );
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // Kafka init
    await initKafka();

    // Kafka consumer loop (🔥 TIPADO CORRECTO 🔥)
    startConsumerLoop(
      async ({
        topic,
        partition,
        message,
      }: {
        topic: string;
        partition: number;
        message: { value: Buffer | null };
      }) => {
        try {
          if (!message.value) return;

          const event = JSON.parse(message.value.toString());

          if (event.action === "create" && event.notification) {
            io.to(event.notification.userId).emit(
              "new-notification",
              event.notification
            );

            console.log(
              "Emitted new-notification to",
              event.notification.userId
            );
          }
        } catch (err) {
          console.error("Error handling kafka message", err);
        }
      }
    ).catch((err) => console.error("Consumer loop error", err));
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();
