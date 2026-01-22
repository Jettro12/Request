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

app.use(cors());
app.use(express.json());

/* =====================================================
   LÓGICA DE NEGOCIO (KAFKA)
===================================================== */

async function updateConversationFromMessage(messageData: any) {
  const { senderId, receiverId, content } = messageData;
  if (!senderId || !receiverId) return;
  const participantIds = [senderId, receiverId].sort();

  try {
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
  } catch (err) {
    console.error("Error updating conversation view:", err);
  }
}

/* =====================================================
   RUTAS API (Sin prefijo /conversations)
===================================================== */

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "conversations-service" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Listado de conversaciones de un usuario
app.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const conversations = await prisma.conversation.findMany({
      where: { participantIds: { has: userId } },
      orderBy: { updatedAt: "desc" },
    });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: "Error fetching conversations" });
  }
});

async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Conversations DB Connected");

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
    console.log("✅ Conversations Kafka Consumer active");

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 Conversations service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start conversations-service:", err);
    process.exit(1);
  }
}

start();
