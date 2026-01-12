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

/* =====================================================
   HEALTH
===================================================== */
app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "posts-service" })
);

/* =====================================================
   POSTS ROUTES
   Manejamos ambas rutas por seguridad (Proxy vs Directo)
===================================================== */

// 1. Rutas Raíz (Lo que envía el Proxy normalmente: /)
app.get("/", getPosts);
app.post("/", createPost);

// 2. Rutas Explícitas (Por si el Proxy envía /posts o trailing slash)
app.get("/posts", getPosts);
app.post("/posts", createPost);

// 3. Rutas con ID
app.get("/:id", getPostById);
app.put("/:id", updatePost);
app.delete("/:id", deletePost);
// Soporte para /posts/:id también
app.get("/posts/:id", getPostById);
app.put("/posts/:id", updatePost);
app.delete("/posts/:id", deletePost);

/* =====================================================
   SHUTDOWN
===================================================== */
const shutdown = async () => {
  console.log("👋 Shutting down posts-service...");
  await disconnectKafka();
  await prisma.$disconnect();
  process.exit(0);
};

async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected (posts)");

    await connectKafkaProducer();

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Posts service listening on ${PORT}`)
    );

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("❌ Failed to start posts-service:", error);
    process.exit(1);
  }
}

start();
