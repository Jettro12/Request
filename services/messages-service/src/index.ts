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

/* =====================================================
   RUTAS (Nginx elimina el prefijo /messages)
===================================================== */

// ✅ RUTA RAÍZ / HEALTH
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "messages-service" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ✅ POST /: Guardar mensaje y notificar a Kafka
app.post("/", async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const message = await prisma.message.create({
      data: { senderId, receiverId, content, isRead: false },
    });

    // Notificar a otros servicios (como conversations-service)
    await producer.send({
      topic: "message-sent",
      messages: [{ key: senderId, value: JSON.stringify(message) }],
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ GET /history/:u1/:u2: Obtener historial entre dos usuarios
app.get("/history/:u1/:u2", async (req, res) => {
  const { u1, u2 } = req.params;
  try {
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
  } catch (error) {
    res.status(500).json({ error: "Error fetching history" });
  }
});

async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Messages DB Connected");

    await producer.connect();
    console.log("✅ Messages Kafka Producer connected");

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 Messages service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start messages-service:", err);
    process.exit(1);
  }
}

start();
