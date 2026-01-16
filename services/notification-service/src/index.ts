import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import cors from "cors";
import { initKafka, startConsumerLoop } from "./kafka";
import { prisma } from "./prisma";

const PORT = process.env.PORT || "4001";
const app = express();
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// ✅ RUTA RAÍZ
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "notification-service" });
});

async function start() {
  await prisma.$connect();
  await initKafka();

  server.listen(Number(PORT), "0.0.0.0", () =>
    console.log(`Notifications on ${PORT}`)
  );

  startConsumerLoop(async ({ message }) => {
    if (!message.value) return;
    const event = JSON.parse(message.value.toString());
    if (event.action === "create") {
      io.to(event.notification.userId).emit(
        "new-notification",
        event.notification
      );
    }
  });
}
start();
