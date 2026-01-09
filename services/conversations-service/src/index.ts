import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4009;

const kafka = new Kafka({
  clientId: "conversations-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "conversations-service-group" });

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
  await consumer.subscribe({ topic: "message-sent", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const messageData = JSON.parse(message.value?.toString() || "{}");
        await updateConversationFromMessage(messageData);
      } catch (error) {
        console.error("Error processing Kafka message:", error);
      }
    },
  });
  console.log("Kafka connected for conversations service");
}

async function updateConversationFromMessage(messageData: any) {
  const { senderId, receiverId } = messageData;
  const participantIds = [senderId, receiverId].sort();

  let conversation = await prisma.conversation.findFirst({
    where: { participantIds: { equals: participantIds } },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participantIds,
        lastMessage: messageData.content.substring(0, 100),
        unreadCount: 1,
      },
    });
    await prisma.conversationParticipant.createMany({
      data: participantIds.map((userId: string) => ({
        conversationId: conversation.id,
        userId,
      })),
    });
  } else {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: messageData.content.substring(0, 100),
        unreadCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });
  }
}

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "conversations-service",
    kafka: producer ? "connected" : "disconnected",
  });
});

app.get("/users/:userId/conversations", async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await prisma.conversation.findMany({
      where: { participantIds: { has: userId } },
      orderBy: { updatedAt: "desc" },
      include: {
        participants: {
          where: { userId: { not: userId } },
          select: { userId: true, lastSeen: true },
        },
      },
    });
    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/conversations", async (req, res) => {
  try {
    const { participantIds, initialMessage } = req.body;
    if (!participantIds || participantIds.length < 2)
      return res.status(400).json({ error: "Invalid participants" });

    const sortedIds = [...participantIds].sort();
    const conversation = await prisma.conversation.create({
      data: {
        participantIds: sortedIds,
        lastMessage: initialMessage?.substring(0, 100) || "New conversation",
        unreadCount: 0,
      },
    });

    await prisma.conversationParticipant.createMany({
      data: sortedIds.map((userId: string) => ({
        conversationId: conversation.id,
        userId,
      })),
    });

    await producer.send({
      topic: "conversation-created",
      messages: [
        {
          key: conversation.id,
          value: JSON.stringify({
            id: conversation.id,
            participantIds: sortedIds,
          }),
        },
      ],
    });

    res.status(201).json(conversation);
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/conversations/:conversationId/read", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastSeen: new Date() },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: { decrement: 1 } },
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error" });
  }
});

async function startServer() {
  try {
    await connectKafka();
    // 👇 CORRECCIÓN IMPORTANTE: AÑADIDO "0.0.0.0"
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Conversations service listening on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start conversations service:", error);
    process.exit(1);
  }
}

startServer();
