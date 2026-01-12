import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";
import {
  getUserProfile,
  searchUsers,
  updateProfile,
  createProfile,
  getUsersByCareer,
} from "./controllers/usersController";
import { eventConsumer } from "./events/consumer";
import UserService from "./services/userService";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4007");
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
  res.json({ status: "ok", service: "users-service" })
);

/* =====================================================
   USERS (PATHS REALES PARA ALB)
===================================================== */
app.get("/users/search", searchUsers); // GET /users/search
app.get("/users/career/:career", getUsersByCareer); // GET /users/career/:career

app.post("/users/profile", createProfile); // POST /users/profile
app.put("/users/:id/profile", updateProfile); // PUT /users/:id/profile

app.get("/users/:id", getUserProfile); // GET /users/:id

/* =====================================================
   START
===================================================== */
async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to users database");

    const userService = new UserService(prisma);
    console.log("✅ UserService initialized");

    if (eventConsumer?.startConsuming) {
      try {
        await eventConsumer.startConsuming(userService);
        console.log("✅ RabbitMQ consumer started");
      } catch (err: any) {
        console.warn("⚠️ RabbitMQ consumer not running:", err.message);
      }
    }

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Users service listening on ${PORT}`)
    );
  } catch (error) {
    console.error("❌ Failed to start users-service:", error);
    process.exit(1);
  }
}

start();
