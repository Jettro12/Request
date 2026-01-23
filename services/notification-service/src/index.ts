import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mqtt from 'mqtt';
import { initKafka, startConsumerLoop } from './kafka';
import { prisma } from './prisma';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4001');
const app = express();

// =========================
// MQTT
// =========================
const mqttUrl = process.env.MQTT_URL || 'mqtt://172.31.69.87:1883';
const mqttClient = mqtt.connect(mqttUrl);

mqttClient.on('connect', () => {
  console.log('📡 Notification Service conectado al Broker MQTT');
});

app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'notification-service',
    mqtt: mqttClient.connected ? 'connected' : 'disconnected',
  });
});

// =========================
// SOCKET.IO
// =========================
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

let isConsumerRunning = false;

io.on('connection', (socket) => {
  socket.on('join', (userId: string) => {
    console.log(`👤 Usuario ${userId} conectado a Socket.io`);
    socket.join(userId);
  });
});

// =========================
// KAFKA + MQTT
// =========================
async function start() {
  try {
    await prisma.$connect();
    await initKafka();

    if (!isConsumerRunning) {
      isConsumerRunning = true;
      await startConsumerLoop(async ({ message }) => {
        try {
          if (!message.value) return;
          const event = JSON.parse(message.value.toString());

          const payload = event.notification || event.post || event;
          const targetId =
            payload.userId || payload.authorId || payload.receiverId;

          if (targetId) {
            // Emitir vía Socket.io (WEB)
            io.to(targetId).emit('new-notification', payload);

            // Emitir vía MQTT (MÓVIL / ESCRITORIO)
            const mqttTopic = `request/user/${targetId}`;
            const mqttPayload = JSON.stringify({
              title: 'Nueva Notificación',
              body: payload.content || 'Tienes nueva actividad',
              date: new Date().toISOString(),
            });

            mqttClient.publish(mqttTopic, mqttPayload);
            console.log(`📣 Alerta enviada a MQTT en topic: ${mqttTopic}`);
          }
        } catch (err) {
          console.error('❌ Error procesando mensaje Kafka:', err);
        }
      });
    }

    server.listen(PORT, '0.0.0.0', () =>
      console.log(`🔔 Notification service listening on ${PORT}`),
    );
  } catch (error) {
    console.error('❌ Error iniciando servicio:', error);
    process.exit(1);
  }
}

start();
