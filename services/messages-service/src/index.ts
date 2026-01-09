import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4008;

const kafka = new Kafka({
  clientId: "messages-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "messages-service-group" });

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

async function connectKafka() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: "user-messages", fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log("Received message:", message.value?.toString());
    },
  });
  console.log("Kafka connected for messages service");
}

app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "messages-service", kafka: "connected" });
});

// 👇 RUTAS ALINEADAS CON NGINX 👇
// NGINX rewrite: /messages → / (antes de pasar al servicio)
// Por lo tanto, las rutas deben ser RAÍZ (/)

app.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    if (!senderId || !receiverId || !content)
      return res.status(400).json({ error: "Missing fields" });

    const message = await prisma.message.create({
      data: { senderId, receiverId, content, isRead: false },
    });

    await producer.send({
      topic: "message-sent",
      messages: [
        {
          key: senderId,
          value: JSON.stringify({
            id: message.id,
            senderId,
            receiverId,
            content,
            timestamp: message.createdAt.toISOString(),
          }),
        },
      ],
    });

    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/messages/:userId1/:userId2", async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const { limit = 50, before } = req.query;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
        ...(before ? { createdAt: { lt: new Date(before as string) } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit as string),
    });

    res.json(messages.reverse());
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/users/:userId/conversations", async (req, res) => {
  try {
    const { userId } = req.params;
    // Usamos template string para query raw
    const conversations = await prisma.$queryRaw`
      SELECT DISTINCT ON (contact_id) 
        m.*,
        CASE 
          WHEN m.sender_id = ${userId} THEN m.receiver_id
          ELSE m.sender_id
        END as contact_id
      FROM "Message" m
      WHERE m.sender_id = ${userId} OR m.receiver_id = ${userId}
      ORDER BY contact_id, m.created_at DESC
    `;
    res.json(conversations);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/messages/read", async (req, res) => {
  try {
    const { messageIds, userId } = req.body;
    const updated = await prisma.message.updateMany({
      where: { id: { in: messageIds }, receiverId: userId },
      data: { isRead: true },
    });
    res.json({ updated: updated.count });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error" });
  }
});

async function startServer() {
  try {
    await connectKafka();
    // 👇 CORRECCIÓN IMPORTANTE: AÑADIDO "0.0.0.0"
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Messages service listening on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start messages service:", error);
    process.exit(1);
  }
}

startServer();
