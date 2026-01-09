import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import { Kafka } from "kafkajs";
import Redis from "ioredis";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4010;

// Configurar Socket.IO con CORS
const io = new SocketIOServer(server, {
  cors: {
    // Permitimos tanto localhost (navegador) como docker (interno)
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

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

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

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
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const event = JSON.parse(message.value?.toString() || "{}");
        await processKafkaEvent(topic, event);
      } catch (error) {
        console.error("Error processing Kafka event:", error);
      }
    },
  });
  console.log("Kafka connected for chat service");
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

io.on("connection", (socket) => {
  console.log(`New socket connection: ${socket.id}`);

  socket.on("authenticate", (data: { userId: string; token?: string }) => {
    const { userId } = data;
    userSockets.set(userId, socket.id);
    socketUsers.set(socket.id, userId);
    socket.join(`user:${userId}`);

    socket.emit("authenticated", { success: true, userId });
    io.emit("user-status", { userId, status: "online" });

    producer.send({
      topic: "user-online",
      messages: [
        {
          key: userId,
          value: JSON.stringify({
            userId,
            socketId: socket.id,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
  });

  socket.on("join-room", (roomId: string) => {
    socket.join(`room:${roomId}`);
    const userId = socketUsers.get(socket.id);
    if (userId) redis.sadd(`room:${roomId}:members`, userId);
    redis.hset(`room:${roomId}`, "lastActivity", new Date().toISOString());
    socket.emit("room-joined", { roomId });
  });

  socket.on("leave-room", (roomId: string) => {
    socket.leave(`room:${roomId}`);
    const userId = socketUsers.get(socket.id);
    if (userId) redis.srem(`room:${roomId}:members`, userId);
  });

  socket.on("send-message", async (data) => {
    try {
      const { roomId, content, senderId } = data;
      if (!roomId || !content || !senderId) {
        socket.emit("error", { message: "Missing required fields" });
        return;
      }
      const message = {
        id: `msg_${Date.now()}_${Math.random()}`,
        roomId,
        senderId,
        content,
        timestamp: new Date().toISOString(),
        type: "chat",
      };

      await redis.lpush(`room:${roomId}:messages`, JSON.stringify(message));
      await redis.ltrim(`room:${roomId}:messages`, 0, 99);

      io.to(`room:${roomId}`).emit("message", message);

      await producer.send({
        topic: "chat-message",
        messages: [{ key: roomId, value: JSON.stringify(message) }],
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("get-messages", async (roomId: string, callback) => {
    try {
      const messages = await redis.lrange(`room:${roomId}:messages`, 0, 50);
      const parsedMessages = messages.map((msg) => JSON.parse(msg)).reverse();
      callback({ success: true, messages: parsedMessages });
    } catch (error) {
      callback({ success: false, error: "Failed to fetch messages" });
    }
  });

  socket.on("typing", (data) => {
    const { roomId, userId, isTyping } = data;
    socket
      .to(`room:${roomId}`)
      .emit("user-typing", { userId, isTyping, roomId });
  });

  socket.on("disconnect", () => {
    const userId = socketUsers.get(socket.id);
    if (userId) {
      userSockets.delete(userId);
      socketUsers.delete(socket.id);
      io.emit("user-status", { userId, status: "offline" });
      producer.send({
        topic: "user-offline",
        messages: [
          {
            key: userId,
            value: JSON.stringify({
              userId,
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      });
    }
  });
});

async function startServer() {
  try {
    await connectKafka();

    // 👇 CORRECCIÓN IMPORTANTE: AÑADIDO "0.0.0.0"
    server.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Chat service (WebSocket) listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start chat service:", error);
    process.exit(1);
  }
}

startServer();
