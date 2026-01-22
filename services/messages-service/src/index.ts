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
  res.json({
    status: "ok",
    service: "messages-service",
    version: "1.0.0",
    endpoints: ["POST /", "GET /history/:u1/:u2"],
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ✅ POST /: Guardar mensaje y notificar a Kafka (requestId REQUERIDO)
app.post("/", async (req, res) => {
  const { senderId, receiverId, content, requestId } = req.body;

  // Validar campos requeridos - requestId es OBLIGATORIO
  if (!senderId || !receiverId || !content || !requestId) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields",
      message: "senderId, receiverId, content, and requestId are required",
      received: { senderId, receiverId, content, requestId },
    });
  }

  // Validar que los IDs no sean inválidos
  const invalidIds = ["undefined", "null", "", undefined, null];
  if (
    invalidIds.includes(senderId) ||
    invalidIds.includes(receiverId) ||
    invalidIds.includes(requestId)
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid IDs",
      message: "senderId, receiverId, and requestId must be valid strings",
    });
  }

  try {
    console.log(
      `Saving message: ${senderId} -> ${receiverId}, request: ${requestId}`,
    );

    const message = await prisma.requestMessage.create({
      data: {
        senderId,
        receiverId,
        content,
        requestId, // ← REQUERIDO
      },
    });

    console.log(`Message saved: ${message.id}`);

    // Notificar a otros servicios (como conversations-service)
    try {
      await producer.send({
        topic: "message-sent",
        messages: [
          {
            key: senderId,
            value: JSON.stringify({
              ...message,
              event: "message.created",
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      });
      console.log(`Kafka event sent for message: ${message.id}`);
    } catch (kafkaError) {
      console.warn(
        "Kafka notification failed (message still saved):",
        kafkaError,
      );
      // Continuar aunque Kafka falle
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error: any) {
    console.error("Error saving message:", error);

    // Errores específicos
    if (error.code === "P2003") {
      // Foreign key constraint
      return res.status(400).json({
        success: false,
        error: "Invalid requestId",
        message: "The request doesn't exist or is invalid",
      });
    }

    if (error.code === "P2002") {
      // Unique constraint
      return res.status(400).json({
        success: false,
        error: "Duplicate message",
        message: "A message with this ID already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to save message",
    });
  }
});

// ✅ GET /history/:u1/:u2: Obtener historial de mensajes
app.get("/history/:u1/:u2", async (req, res) => {
  const { u1, u2 } = req.params;
  const { requestId, limit } = req.query;

  // 🛡️ ESCUDO DE VALIDACIÓN:
  const invalidIds = ["undefined", "null", "", undefined, null];

  if (invalidIds.includes(u1) || invalidIds.includes(u2)) {
    console.warn(
      `[History] Intento de consulta con IDs inválidos: u1=${u1}, u2=${u2}`,
    );
    return res.json({
      success: true,
      data: [],
      message: "Invalid user IDs provided",
    });
  }

  try {
    console.log(
      `Fetching history between ${u1} and ${u2}, requestId: ${requestId || "all"}`,
    );

    const whereClause: any = {
      OR: [
        { senderId: u1, receiverId: u2 },
        { senderId: u2, receiverId: u1 },
      ],
    };

    // Si se proporciona requestId, filtrar por él
    if (requestId && !invalidIds.includes(requestId as string)) {
      whereClause.requestId = requestId;
    }

    const takeLimit = limit ? parseInt(limit as string) : undefined;

    const messages = await prisma.requestMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
      take: takeLimit,
    });

    console.log(`Found ${messages.length} messages`);

    res.json({
      success: true,
      data: messages,
      count: messages.length,
      requestId: requestId || null,
    });
  } catch (error: any) {
    console.error("Error fetching history from DB:", error);

    // Si la tabla no existe, retornar vacío en lugar de error
    if (error.code === "P2021" || error.code === "P2010") {
      console.warn("Messages table doesn't exist yet, returning empty array");
      return res.json({
        success: true,
        data: [],
        message: "No messages found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Error fetching history",
      message: "Failed to load messages",
    });
  }
});

// ✅ GET /:id: Obtener un mensaje específico
app.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || ["undefined", "null", ""].includes(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid message ID",
    });
  }

  try {
    const message = await prisma.requestMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

async function start() {
  try {
    // Conectar a la base de datos
    await prisma.$connect();
    console.log("✅ Messages DB Connected");

    // Conectar a Kafka
    await producer.connect();
    console.log("✅ Messages Kafka Producer connected");

    // Iniciar servidor
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 Messages service listening on port ${PORT}`);
      console.log(`📝 Endpoints:`);
      console.log(
        `   POST / - Send message (requires: senderId, receiverId, content, requestId)`,
      );
      console.log(`   GET /history/:u1/:u2 - Get message history`);
      console.log(`   GET /:id - Get specific message`);
    });
  } catch (err) {
    console.error("❌ Failed to start messages-service:", err);
    process.exit(1);
  }
}

// Manejo de señales para shutdown limpio
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await prisma.$disconnect();
  await producer.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await prisma.$disconnect();
  await producer.disconnect();
  process.exit(0);
});

start();
