import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";
import {
  createRequest,
  getUserRequests,
  updateRequestStatus,
  completeRequest,
  getRequestByChat,
} from "./controllers/requestsController";
import { initKafka, checkKafkaConnection } from "./kafka";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4003");
const KAFKA_ENABLED = process.env.KAFKA_ENABLED !== "false"; // ← Definir aquí
const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://frontend:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  }),
);

app.use(express.json());

/* =====================================================
   MIDDLEWARE DE LOGGING
===================================================== */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

/* =====================================================
   RUTAS DEL MICROSERVICIO
===================================================== */

// ✅ RUTA RAÍZ (GET /): Informativa
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "requests-service",
    description: "Handles help requests",
    kafka: KAFKA_ENABLED ? "enabled" : "disabled",
    endpoints: {
      create: "POST /",
      getUserRequests: "GET /user/:userId?type=sent|received",
      getChatRequest: "GET /chat/:userId?otherUserId=...",
      updateStatus: "PUT /:id/status",
      complete: "POST /:id/complete",
      health: "GET /health",
    },
  });
});

// ✅ RUTA RAÍZ (POST /): Crea una nueva solicitud
app.post("/", createRequest);

// ✅ Health check completo
app.get("/health", async (req, res) => {
  try {
    // Verificar base de datos
    await prisma.$queryRaw`SELECT 1`;
    const dbStatus = "connected";

    // Verificar Kafka (no crítica)
    let kafkaStatus = "unknown";
    if (KAFKA_ENABLED) {
      try {
        kafkaStatus = (await checkKafkaConnection())
          ? "connected"
          : "disconnected";
      } catch (kafkaErr) {
        kafkaStatus = "error";
      }
    } else {
      kafkaStatus = "disabled";
    }

    res.json({
      status: "ok",
      service: "requests-service",
      database: dbStatus,
      kafka: kafkaStatus,
      kafka_enabled: KAFKA_ENABLED,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      status: "error",
      service: "requests-service",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

// ✅ Rutas funcionales
app.get("/user/:userId", getUserRequests);
app.get("/chat/:userId", getRequestByChat);
app.post("/:id/complete", completeRequest);
app.put("/:id/status", updateRequestStatus);

// ✅ Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.url,
    method: req.method,
    availableEndpoints: [
      "GET /",
      "POST /",
      "GET /health",
      "GET /user/:userId",
      "GET /chat/:userId",
      "PUT /:id/status",
      "POST /:id/complete",
    ],
  });
});

// ✅ Manejo global de errores
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Global error handler:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message || "Unknown error",
      timestamp: new Date().toISOString(),
    });
  },
);

/* =====================================================
   INICIALIZACIÓN DEL SERVIDOR
===================================================== */
async function start() {
  try {
    console.log("🚀 Starting Requests Service...");
    console.log("Environment:", process.env.NODE_ENV || "development");
    console.log("Port:", PORT);
    console.log("Kafka enabled:", KAFKA_ENABLED);

    // 1. Conectar a la base de datos
    await prisma.$connect();
    console.log("✅ PostgreSQL database connected");

    // 2. Inicializar Kafka (no bloqueante)
    if (KAFKA_ENABLED) {
      console.log("🔄 Initializing Kafka in background...");
      // Usar setTimeout para no bloquear el inicio
      setTimeout(async () => {
        try {
          const kafkaInitialized = await initKafka();
          if (kafkaInitialized) {
            console.log("✅ Kafka initialization complete");
          } else {
            console.log("⚠️ Kafka initialization failed or not needed");
          }
        } catch (kafkaError) {
          console.warn("⚠️ Kafka background initialization error:", kafkaError);
        }
      }, 10000); // Esperar 10 segundos antes de intentar
    } else {
      console.log("ℹ️ Kafka is disabled, skipping initialization");
    }

    // 3. Iniciar servidor inmediatamente
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Requests service listening on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 Kafka status: ${KAFKA_ENABLED ? "ENABLED" : "DISABLED"}`);
    });

    // 4. (Opcional) Verificación periódica de Kafka
    if (KAFKA_ENABLED) {
      setInterval(async () => {
        try {
          const isConnected = await checkKafkaConnection();
          if (!isConnected) {
            console.log("🔄 Kafka disconnected, attempting to reconnect...");
            await initKafka();
          }
        } catch (error) {
          // Ignorar errores en el intervalo
        }
      }, 60000); // Verificar cada 60 segundos
    }

    // 5. Manejar shutdown graceful
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      try {
        await prisma.$disconnect();
        console.log("✅ Database disconnected");
      } catch (dbError) {
        console.error("Error disconnecting database:", dbError);
      }

      process.exit(0);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
}

// Iniciar el servidor
start();
