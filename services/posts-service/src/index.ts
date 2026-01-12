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
   POSTS (SIN NGINX, PATHS REALES)
===================================================== */
app.get("/posts", getPosts); // GET /posts
app.post("/posts", createPost); // POST /posts

app.get("/posts/:id", getPostById); // GET /posts/:id
app.put("/posts/:id", updatePost); // PUT /posts/:id
app.delete("/posts/:id", deletePost); // DELETE /posts/:id

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
