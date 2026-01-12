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
      "http://localhost:8080",
      "http://frontend:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "posts-service" })
);

// 👇 AQUÍ ESTÁ EL ARREGLO PARA EL ERROR 405 👇
// Escuchamos en la raíz (para cuando el proxy funciona bien)
app.get("/", getPosts);
app.post("/", createPost);

// Y TAMBIÉN escuchamos en /posts (por si el proxy envía la ruta completa)
app.get("/posts", getPosts);
app.post("/posts", createPost);

app.get("/:id", getPostById);
app.put("/:id", updatePost);
app.delete("/:id", deletePost);

const shutdown = async () => {
  await disconnectKafka();
  await prisma.$disconnect();
  process.exit(0);
};

async function start() {
  await prisma.$connect();
  await connectKafkaProducer();
  app.listen(PORT, "0.0.0.0", () => console.log(`Posts listening on ${PORT}`));
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start();
