import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import { Kafka } from "kafkajs";
import Redis from "ioredis";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4010;

// ==========================================
// CONFIGURACIÓN DE SOCKET.IO
// ==========================================
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // En producción puedes restringirlo al DNS del ALB
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// ==========================================
// INFRAESTRUCTURA (REDIS & KAFKA)
// ==========================================
const redis = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

const kafka = new Kafka({
  clientId: "chat-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "chat-service-group" });

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// RUTAS HTTP (FUNDAMENTAL PARA NGINX)
// ==========================================

// ✅ RUTA RAÍZ: Evita 404 cuando Nginx redirige a /chat/
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "chat-service",
    info: "WebSocket server is running",
  });
});

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "chat-service",
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
    kafka: "connected",
    redis: redis.status === "ready" ? "connected" : "disconnected",
  });
});

// OBTENER INFO DE SALA
app.get("/rooms/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const roomInfo = await redis.hgetall(`room:${roomId}`);
    res.json(roomInfo);
  } catch (error) {
    console.error("Error fetching room info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// LÓGICA DE SOCKETS Y KAFKA
// ==========================================
const userSockets = new Map<string, string>();
const socketUsers = new Map<string, string>();

async function connectKafka() {
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({ topic: "message-sent", fromBeginning: false });
  await consumer.subscribe({
    topic: "conversation-created",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const event = JSON.parse(message.value?.toString() || "{}");
        await processKafkaEvent(topic, event);
      } catch (error) {
        console.error("Error processing Kafka event:", error);
      }
    },
  });
  console.log("✅ Chat Service: Kafka connected");
}

async function processKafkaEvent(topic: string, event: any) {
  switch (topic) {
    case "message-sent":
      const { senderId, receiverId } = event;
      [senderId, receiverId].forEach((userId) => {
        const socketId = userSockets.get(userId);
        if (socketId) {
          io.to(socketId).emit("new-message", { ...event, type: "direct" });
        }
      });
      break;
    case "conversation-created":
      const { participantIds } = event;
      participantIds.forEach((userId: string) => {
        const socketId = userSockets.get(userId);
        if (socketId) {
          io.to(socketId).emit("conversation-updated", event);
        }
      });
      break;
  }
}

// EVENTOS DE SOCKET.IO
io.on("connection", (socket) => {
  console.log(`New socket connection: ${socket.id}`);

  socket.on("authenticate", (data: { userId: string }) => {
    const { userId } = data;
    userSockets.set(userId, socket.id);
    socketUsers.set(socket.id, userId);
    socket.join(`user:${userId}`);
    socket.emit("authenticated", { success: true, userId });
    io.emit("user-status", { userId, status: "online" });
  });

  socket.on("join-room", (roomId: string) => {
    socket.join(`room:${roomId}`);
    const userId = socketUsers.get(socket.id);
    if (userId) redis.sadd(`room:${roomId}:members`, userId);
    socket.emit("room-joined", { roomId });
  });

  socket.on("send-message", async (data) => {
    const { roomId, content, senderId } = data;
    const message = {
      id: `msg_${Date.now()}`,
      roomId,
      senderId,
      content,
      timestamp: new Date().toISOString(),
    };
    io.to(`room:${roomId}`).emit("message", message);
    await producer.send({
      topic: "chat-message",
      messages: [{ key: roomId, value: JSON.stringify(message) }],
    });
  });

  socket.on("disconnect", () => {
    const userId = socketUsers.get(socket.id);
    if (userId) {
      userSockets.delete(userId);
      socketUsers.delete(socket.id);
      io.emit("user-status", { userId, status: "offline" });
    }
  });
});

// ==========================================
// ARRANQUE DEL SERVIDOR
// ==========================================
async function startServer() {
  try {
    await connectKafka();
    // Escuchamos en 0.0.0.0 para que Docker permita el acceso externo
    server.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 Chat service (WebSocket) listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start chat service:", error);
    process.exit(1);
  }
}

startServer();
