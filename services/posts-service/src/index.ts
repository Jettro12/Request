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

// 🛡️ CORS
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

// 👇 RUTAS ALINEADAS CON NGINX 👇
// NGINX rewrite: /posts/ → / (antes de pasar al servicio)
// Por lo tanto, las rutas deben ser RAÍZ (/)

// 1. Health check
app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "posts-service" })
);

// 2. Rutas ROOT (NGINX rewrite /posts/ → /)
app.get("/", getPosts); // GET / → GET /posts (via NGINX)
app.post("/", createPost); // POST / → POST /posts (via NGINX)

// 3. Rutas con parámetros
app.get("/:id", getPostById); // GET /:id → GET /posts/:id (via NGINX)
app.put("/:id", updatePost); // PUT /:id → PUT /posts/:id (via NGINX)
app.delete("/:id", deletePost); // DELETE /:id → DELETE /posts/:id (via NGINX)

// Manejo de señales para desconexión limpia
const shutdown = async () => {
  console.log("👋 Shutting down gracefully...");
  await disconnectKafka();
  await prisma.$disconnect();
  process.exit(0);
};

async function start() {
  try {
    // Conectar a la base de datos
    await prisma.$connect();
    console.log("✅ Database connected");

    // Conectar a Kafka
    await connectKafkaProducer();

    // Iniciar servidor
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Posts service listening on port ${PORT}`)
    );

    // Capturar señales de terminación
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("❌ Failed to start the server:", error);
    process.exit(1);
  }
}

start();
