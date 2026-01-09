import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";
// Ajusta la ruta de importación a donde tengas tu controlador
import {
  createRequest,
  getUserRequests,
  updateRequestStatus,
  completeRequest,
  getRequestByChat,
} from "./controllers/requestsController";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4003");
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

// 👇 RUTAS ALINEADAS CON CLIENT.TS 👇

// ApiClient.requests.createRequest() -> POST /
app.post("/", createRequest);

// ApiClient.requests.getUserRequests() -> GET /user/:userId
app.get("/user/:userId", getUserRequests);

// ApiClient.requests.updateRequestStatus() -> PUT /:id/status
app.put("/:id/status", updateRequestStatus);

// ApiClient.requests.completeRequest() -> POST /:id/complete
app.post("/:id/complete", completeRequest);

// GET /chat/:userId - Obtener request por chat (para frontend)
app.get("/chat/:userId", getRequestByChat);

app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "requests-service" })
);

async function start() {
  await prisma.$connect();
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`Requests service listening on ${PORT}`)
  );
}
start();
