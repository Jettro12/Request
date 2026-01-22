import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";
import {
  getPosts,
  createPost,
  getPostById,
  deletePost,
  updatePost,
} from "./controllers/postsController";
import { connectKafkaProducer, disconnectKafka } from "./kafka";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4002");
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://frontend:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* =====================================================
   RUTAS DEL MICROSERVICIO (Sin prefijo /posts)
===================================================== */

// ✅ RUTA RAÍZ (GET /): Ahora responde con la lista de posts
app.get("/", getPosts);

// ✅ RUTA RAÍZ (POST /): Ahora permite crear posts directamente
app.post("/", createPost);

// Health check para el Load Balancer
app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "posts-service" })
);

// ✅ RUTAS DINÁMICAS (Van al final para no atrapar /health)
app.get("/:id", getPostById);
app.put("/:id", updatePost);
app.delete("/:id", deletePost);

const shutdown = async () => {
  console.log("Shutting down gracefully...");
  await disconnectKafka();
  await prisma.$disconnect();
  process.exit(0);
};

async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Posts DB Connected");

    try {
      await connectKafkaProducer();
      console.log("✅ Kafka Producer connected");
    } catch (kErr) {
      console.error(
        "⚠️ Kafka connection failed, but service will start:",
        kErr
      );
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Posts service listening on port ${PORT}`);
    });

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("❌ Failed to start posts-service:", err);
    process.exit(1);
  }
}

start();
