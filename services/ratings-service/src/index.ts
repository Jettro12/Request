import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4006");
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

app.post("/ratings", async (req, res) => {
  const { fromUser, toUser, score, comment } = req.body;
  if (!fromUser || !toUser || typeof score !== "number")
    return res.status(400).json({ error: "invalid" });
  try {
    const rating = await prisma.rating.create({
      data: { fromUser, toUser, score, comment },
    });
    res.json({ rating });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get("/ratings", async (req, res) => {
  const toUser = String(req.query.toUser || "");
  const ratings = await prisma.rating.findMany({ where: { toUser } });
  res.json({ ratings });
});

app.get("/health", (_req, res) => {
  const dbState = prisma ? "ok" : "unknown";
  res.json({ status: "ok", service: "ratings-service", db: dbState });
});

async function start() {
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`Ratings service listening on ${PORT}`)
  );

  const maxDbRetries = 8;
  let dbAttempt = 0;
  while (dbAttempt < maxDbRetries) {
    try {
      await prisma.$connect();
      console.log("Ratings prisma connected");
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
  console.error("Failed to start ratings-service", err);
  process.exit(1);
});
