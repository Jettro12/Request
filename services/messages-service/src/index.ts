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

app.use(cors());
app.use(express.json());

// ✅ RUTA RAÍZ
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "messages-service" });
});

app.post("/", async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  try {
    const message = await prisma.message.create({
      data: { senderId, receiverId, content, isRead: false },
    });
    await producer.send({
      topic: "message-sent",
      messages: [{ key: senderId, value: JSON.stringify(message) }],
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Error saving message" });
  }
});

app.get("/messages/:u1/:u2", async (req, res) => {
  const { u1, u2 } = req.params;
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: u1, receiverId: u2 },
        { senderId: u2, receiverId: u1 },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
  res.json(messages);
});

async function start() {
  await prisma.$connect();
  await producer.connect();
  app.listen(Number(PORT), "0.0.0.0", () => console.log(`Messages on ${PORT}`));
}
start();
