import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4005");
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

app.get("/profile/:id", async (req, res) => {
  const id = req.params.id;
  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile) return res.status(404).json({ error: "not found" });
  res.json({ profile });
});

app.patch("/profile/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const updated = await prisma.profile.update({
      where: { id },
      data: req.body,
    });
    res.json({ profile: updated });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get("/health", (_req, res) => {
  const dbState = prisma ? "ok" : "unknown";
  res.json({ status: "ok", service: "profile-service", db: dbState });
});

async function start() {
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`Profile service listening on ${PORT}`)
  );

  const maxDbRetries = 8;
  let dbAttempt = 0;
  while (dbAttempt < maxDbRetries) {
    try {
      await prisma.$connect();
      console.log("Profile prisma connected");
      break;
    } catch (err) {
      dbAttempt++;
      console.warn(
        `Prisma connect attempt ${dbAttempt} failed: ${err}. Retrying in 2s...`
      );
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

start().catch((err) => {
  console.error("Failed to start profile-service", err);
  process.exit(1);
});
