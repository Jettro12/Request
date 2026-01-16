import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4009;

// CONFIGURACIÓN KAFKA
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
      "http://frontend:3000",
    ],
    credentials: true,
  })
);

app.use(express.json());

// ✅ RUTA RAÍZ
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "conversations-service" });
});

// LÓGICA DE ACTUALIZACIÓN DESDE KAFKA
async function updateConversationFromMessage(messageData: any) {
  const { senderId, receiverId, content } = messageData;
  if (!senderId || !receiverId) return;
  const participantIds = [senderId, receiverId].sort();

  let conversation = await prisma.conversation.findFirst({
    where: { participantIds: { equals: participantIds } },
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

async function connectKafka() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: "message-sent", fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const data = JSON.parse(message.value.toString());
      await updateConversationFromMessage(data);
    },
  });
}

// RUTAS API
app.get("/users/:userId/conversations", async (req, res) => {
  const { userId } = req.params;
  const conversations = await prisma.conversation.findMany({
    where: { participantIds: { has: userId } },
    orderBy: { updatedAt: "desc" },
  });
  res.json(conversations);
});

async function start() {
  await prisma.$connect();
  await connectKafka();
  app.listen(Number(PORT), "0.0.0.0", () =>
    console.log(`Conversations listening on ${PORT}`)
  );
}
start();
