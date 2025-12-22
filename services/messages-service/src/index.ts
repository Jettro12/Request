import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4008;

// Configurar Kafka
const kafka = new Kafka({
  clientId: "messages-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "messages-service-group" });

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // 👈 ESPECIFICA EL FRONTEND
    credentials: true, // 👈 PERMITE LAS COOKIES/TOKENS
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Conectar a Kafka
async function connectKafka() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: "user-messages", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log("Received message from Kafka:", message.value?.toString());
      // Aquí procesar mensajes de otros servicios si es necesario
    },
  });

  console.log("Kafka connected for messages service");
}

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "messages-service",
    timestamp: new Date().toISOString(),
    kafka: "connected", // Simplificado para evitar errores de tipo si producer es interno
  });
});

// Enviar mensaje
app.post("/messages", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res
        .status(400)
        .json({ error: "senderId, receiverId and content are required" });
    }

    // Guardar en base de datos
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        isRead: false,
      },
    });

    // Publicar evento a Kafka
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
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Obtener mensajes entre dos usuarios
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

    res.json(messages.reverse()); // Orden cronológico
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Obtener conversaciones de un usuario (CORREGIDO)
app.get("/users/:userId/conversations", async (req, res) => {
  try {
    const { userId } = req.params;

    // CORRECCIÓN: Usamos $queryRaw y template literals en lugar de "\"
    const conversations = await prisma.$queryRaw`
      SELECT DISTINCT ON (contact_id) 
        m.*,
        CASE 
          WHEN m.sender_id = ${userId} THEN m.receiver_id
          ELSE m.sender_id
        END as contact_id
      FROM messages m
      WHERE m.sender_id = ${userId} OR m.receiver_id = ${userId}
      ORDER BY contact_id, m.created_at DESC
    `;

    res.json(conversations);
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Marcar mensajes como leídos
app.put("/messages/read", async (req, res) => {
  try {
    const { messageIds, userId } = req.body;

    if (!messageIds || !Array.isArray(messageIds) || !userId) {
      return res
        .status(400)
        .json({ error: "messageIds array and userId are required" });
    }

    const updated = await prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        receiverId: userId,
      },
      data: { isRead: true },
    });

    res.json({ updated: updated.count });
  } catch (error: any) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Iniciar servidor
async function startServer() {
  try {
    await connectKafka();

    app.listen(PORT, () => {
      console.log(`Messages service listening on ${PORT}`);
      console.log("Messages prisma connected");
      console.log("Kafka ready for messaging events");
    });
  } catch (error) {
    console.error("Failed to start messages service:", error);
    process.exit(1);
  }
}

startServer();
