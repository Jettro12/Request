import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initKafka } from "./kafka";
import { prisma } from "./prisma";
import {
  getPosts,
  createPost,
  getPostById,
  deletePost,
} from "./controllers/postsController";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4002");
const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // 👈 ESPECIFICA EL FRONTEND
    credentials: true, // 👈 PERMITE LAS COOKIES/TOKENS
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Routes
app.get("/posts", getPosts);
app.post("/posts", createPost);
app.get("/posts/:id", getPostById);
app.delete("/posts/:id", deletePost);

// Health check
app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "posts-service" })
);

// Start
async function start() {
  try {
    await prisma.$connect();
    await initKafka();
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`Posts service listening on ${PORT}`)
    );
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();
