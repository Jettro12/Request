import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4004");
const app = express();
app.use(
  cors({
    // Permitimos tanto localhost como 127.0.0.1 por si acaso
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true, // 👈 ¡ESTO ES LA CLAVE! Permite pasar las cookies/headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Basic auth routes (scaffold)
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "missing" });
  try {
    const user = await prisma.user.create({ data: { name, email, password } });
    res.json({ user });
  } catch (err) {
    res
      .status(500)
      .json({ error: "failed to create user", details: String(err) });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "missing" });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password)
    return res.status(401).json({ error: "invalid" });
  res.json({ user });
});

app.get("/health", (_req, res) => {
  const dbState = prisma ? "ok" : "unknown";
  res.json({ status: "ok", service: "auth-service", db: dbState });
});

async function start() {
  serverListen();

  // prisma warmup with retries
  const maxDbRetries = 8;
  let dbAttempt = 0;
  while (dbAttempt < maxDbRetries) {
    try {
      await prisma.$connect();
      console.log("Auth prisma connected");
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

function serverListen() {
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`Auth service listening on ${PORT}`)
  );
}

start().catch((err) => {
  console.error("Failed to start auth-service", err);
  process.exit(1);
});
