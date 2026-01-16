import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";

dotenv.config();
const PORT = parseInt(process.env.PORT || "4006");
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://frontend:3000",
    ],
    credentials: true,
  })
);
app.use(express.json());

// ✅ RUTA RAÍZ
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "ratings-service" });
});

app.post("/", async (req, res) => {
  const { fromUser, toUser, score, comment } = req.body;
  try {
    const rating = await prisma.rating.create({
      data: { fromUser, toUser, score, comment },
    });
    res.json({ rating });
  } catch (err) {
    res.status(500).json({ error: "Failed to create rating" });
  }
});

app.get("/", async (req, res) => {
  const toUser = String(req.query.toUser || "");
  const ratings = await prisma.rating.findMany({ where: { toUser } });
  res.json({ ratings });
});

async function start() {
  await prisma.$connect();
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`Ratings listening on ${PORT}`)
  );
}
start();
