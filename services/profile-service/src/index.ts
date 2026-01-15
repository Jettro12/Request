import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4005");
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://frontend:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/**
 * 🚀 RUTA RAÍZ (Evita el 404 "Cannot GET /" desde Nginx)
 */
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "profile-service",
    timestamp: new Date().toISOString(),
  });
});

/**
 * HEALTH CHECK
 */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", db: prisma ? "connected" : "error" });
});

/**
 * OBTENER PERFIL POR ID
 */
app.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await prisma.profile.findUnique({ where: { id } });
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json({ profile });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * ACTUALIZAR PERFIL
 */
app.patch("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.profile.update({
      where: { id },
      data: req.body,
    });
    res.json({ profile: updated });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

async function start() {
  const maxDbRetries = 8;
  let dbAttempt = 0;

  while (dbAttempt < maxDbRetries) {
    try {
      await prisma.$connect();
      console.log("✅ Profile Service: Prisma connected");
      break;
    } catch (err) {
      dbAttempt++;
      console.warn(`⚠️ DB connection retry ${dbAttempt}/${maxDbRetries}...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Profile service listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Failed to start profile-service", err);
  process.exit(1);
});
