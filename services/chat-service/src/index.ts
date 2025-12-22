import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { Kafka } from 'kafkajs';
import Redis from 'ioredis';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4010;

// Configurar Socket.IO con CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || \"http://localhost:3000\",
    methods: [\"GET\", \"POST\"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Configurar Redis para escalabilidad (opcional)
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryStrategy: (times) => Math.min(times * 50, 2000)
});

// Configurar Kafka
const kafka = new Kafka({
  clientId: 'chat-service',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'chat-service-group' });

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // 👈 ESPECIFICA EL FRONTEND
    credentials: true, // 👈 PERMITE LAS COOKIES/TOKENS
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'chat-service',
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
    kafka: 'connected',
    redis: redis.status === 'ready' ? 'connected' : 'disconnected'
  });
});

// API REST para obtener información de chat
app.get('/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const roomInfo = await redis.hgetall(\
oom:\\);
    res.json(roomInfo);
  } catch (error) {
    console.error('Error fetching room info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Almacenar conexiones de usuarios
const userSockets = new Map<string, string>(); // userId -> socketId
const socketUsers = new Map<string, string>(); // socketId -> userId

// Conectar a Kafka
async function connectKafka() {
  await producer.connect();
  await consumer.connect();
  
  // Escuchar eventos de mensajes
  await consumer.subscribe({ topic: 'message-sent', fromBeginning: false });
  await consumer.subscribe({ topic: 'conversation-created', fromBeginning: false });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const event = JSON.parse(message.value?.toString() || '{}');
        console.log(\Received Kafka event from \:\, event.id);
        
        // Procesar eventos para notificar en tiempo real
        await processKafkaEvent(topic, event);
      } catch (error) {
        console.error('Error processing Kafka event:', error);
      }
    },
  });
  
  console.log('Kafka connected for chat service');
}

async function processKafkaEvent(topic: string, event: any) {
  switch (topic) {
    case 'message-sent':
      // Notificar a los participantes de la conversación
      const { senderId, receiverId, content } = event;
      
      // Enviar a ambos usuarios si están conectados
      [senderId, receiverId].forEach(userId => {
        const socketId = userSockets.get(userId);
        if (socketId) {
          io.to(socketId).emit('new-message', {
            ...event,
            type: 'direct'
          });
        }
      });
      break;
      
    case 'conversation-created':
      // Notificar a todos los participantes
      const { participantIds } = event;
      participantIds.forEach((userId: string) => {
        const socketId = userSockets.get(userId);
        if (socketId) {
          io.to(socketId).emit('conversation-updated', event);
        }
      });
      break;
  }
}

// Configurar Socket.IO
io.on('connection', (socket) => {
  console.log(\New socket connection: \\);
  
  // Autenticar usuario
  socket.on('authenticate', (data: { userId: string; token?: string }) => {
    const { userId } = data;
    
    // Guardar relación usuario-socket
    userSockets.set(userId, socket.id);
    socketUsers.set(socket.id, userId);
    
    // Unir al usuario a su sala personal
    socket.join(\user:\\);
    
    console.log(\User \ authenticated on socket \\);
    socket.emit('authenticated', { success: true, userId });
    
    // Notificar que el usuario está online
    io.emit('user-status', { userId, status: 'online' });
    
    // Publicar evento a Kafka
    producer.send({
      topic: 'user-online',
      messages: [
        {
          key: userId,
          value: JSON.stringify({
            userId,
            socketId: socket.id,
            timestamp: new Date().toISOString()
          })
        }
      ]
    });
  });
  
  // Unirse a una sala de chat
  socket.on('join-room', (roomId: string) => {
    socket.join(\
oom:\\);
    console.log(\Socket \ joined room \\);
    
    // Guardar en Redis
    redis.sadd(\
oom:\:members\, socketUsers.get(socket.id) || 'anonymous');
    redis.hset(\
oom:\\, 'lastActivity', new Date().toISOString());
    
    socket.emit('room-joined', { roomId });
  });
  
  // Dejar una sala
  socket.on('leave-room', (roomId: string) => {
    socket.leave(\
oom:\\);
    console.log(\Socket \ left room \\);
    
    // Actualizar Redis
    const userId = socketUsers.get(socket.id);
    if (userId) {
      redis.srem(\
oom:\:members\, userId);
    }
  });
  
  // Enviar mensaje en tiempo real
  socket.on('send-message', async (data) => {
    try {
      const { roomId, content, senderId } = data;
      
      if (!roomId || !content || !senderId) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }
      
      const message = {
        id: \msg_\_\\,
        roomId,
        senderId,
        content,
        timestamp: new Date().toISOString(),
        type: 'chat'
      };
      
      // Guardar en Redis temporalmente
      await redis.lpush(\
oom:\:messages\, JSON.stringify(message));
      await redis.ltrim(\
oom:\:messages\, 0, 99); // Mantener solo 100 mensajes
      
      // Enviar a todos en la sala
      io.to(\
oom:\\).emit('message', message);
      
      // Publicar evento a Kafka
      await producer.send({
        topic: 'chat-message',
        messages: [
          {
            key: roomId,
            value: JSON.stringify(message)
          }
        ]
      });
      
      console.log(\Message sent to room \ from \\);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Obtener historial de mensajes
  socket.on('get-messages', async (roomId: string, callback) => {
    try {
      const messages = await redis.lrange(\
oom:\:messages\, 0, 50);
      const parsedMessages = messages.map(msg => JSON.parse(msg)).reverse();
      callback({ success: true, messages: parsedMessages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      callback({ success: false, error: 'Failed to fetch messages' });
    }
  });
  
  // Typing indicator
  socket.on('typing', (data: { roomId: string; userId: string; isTyping: boolean }) => {
    const { roomId, userId, isTyping } = data;
    socket.to(\
oom:\\).emit('user-typing', {
      userId,
      isTyping,
      roomId
    });
  });
  
  // Desconexión
  socket.on('disconnect', () => {
    const userId = socketUsers.get(socket.id);
    
    if (userId) {
      // Eliminar de los mapas
      userSockets.delete(userId);
      socketUsers.delete(socket.id);
      
      // Notificar que el usuario está offline
      io.emit('user-status', { userId, status: 'offline' });
      
      // Publicar evento a Kafka
      producer.send({
        topic: 'user-offline',
        messages: [
          {
            key: userId,
            value: JSON.stringify({
              userId,
              timestamp: new Date().toISOString()
            })
          }
        ]
      });
    }
    
    console.log(\Socket disconnected: \\);
  });
});

// Iniciar servidor
async function startServer() {
  try {
    await connectKafka();
    
    server.listen(PORT, () => {
      console.log(\Chat service (WebSocket) listening on port \\);
      console.log('Socket.IO ready for real-time communication');
      console.log('Kafka connected for event processing');
    });
  } catch (error) {
    console.error('Failed to start chat service:', error);
    process.exit(1);
  }
}

startServer();
