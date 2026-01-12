import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4009;

/* =========================
   KAFKA SETUP
========================= */

const kafka = new Kafka({
  clientId: "conversations-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({
  groupId: "conversations-service-group",
});

/* =========================
   MIDDLEWARE
========================= */

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

/* =========================
   KAFKA CONNECTION
========================= */

async function connectKafka() {
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({
    topic: "message-sent",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        if (!message.value) return;
        const messageData = JSON.parse(message.value.toString());
        await updateConversationFromMessage(messageData);
      } catch (error) {
        console.error("Error processing Kafka message:", error);
      }
    },
  });

  console.log("Kafka connected for conversations service");
}

/* =========================
   DOMAIN LOGIC
========================= */

async function updateConversationFromMessage(messageData: any) {
  const { senderId, receiverId, content } = messageData;
  if (!senderId || !receiverId) return;

  const participantIds = [senderId, receiverId].sort();

  let conversation = await prisma.conversation.findFirst({
    where: {
      participantIds: {
        equals: participantIds,
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participantIds,
        lastMessage: content?.substring(0, 100) || null,
        unreadCount: 1,
      },
    });

    await prisma.conversationParticipant.createMany({
      data: participantIds.map((userId: string) => ({
        conversationId: conversation!.id,
        userId,
      })),
    });
  } else {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: content?.substring(0, 100) || conversation.lastMessage,
        unreadCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });
  }
}

/* =========================
   HEALTH
========================= */

app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    service: "conversations-service",
    kafka: "connected",
  });
});

/* =========================
   ROUTES
========================= */

app.get("/users/:userId/conversations", async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: { has: userId },
      },
      orderBy: { updatedAt: "desc" },
    });

    const conversationIds = conversations.map((c) => c.id);

    const participants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId: { in: conversationIds },
        userId: { not: userId },
      },
      select: {
        conversationId: true,
        userId: true,
        lastSeen: true,
      },
    });

    const participantsByConversation = participants.reduce((acc, p) => {
      acc[p.conversationId] = acc[p.conversationId] || [];
      acc[p.conversationId].push({
        userId: p.userId,
        lastSeen: p.lastSeen,
      });
      return acc;
    }, {} as Record<string, any[]>);

    const result = conversations.map((conversation) => ({
      ...conversation,
      participants: participantsByConversation[conversation.id] || [],
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching conversations", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/conversations", async (req, res) => {
  try {
    const { participantIds, initialMessage } = req.body;

    if (!participantIds || participantIds.length < 2) {
      return res.status(400).json({ error: "Invalid participants" });
    }

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
  } catch (error) {
    console.error("Error creating conversation", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/conversations/:conversationId/read", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: {
        lastSeen: new Date(),
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        unreadCount: {
          decrement: 1,
        },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking conversation as read", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* =========================
   START SERVER
========================= */

async function startServer() {
  try {
    await connectKafka();
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Conversations service listening on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start conversations service:", error);
    process.exit(1);
  }
}

startServer();
