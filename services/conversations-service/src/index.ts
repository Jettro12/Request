import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Kafka } from 'kafkajs';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4009;

// Configurar Kafka
const kafka = new Kafka({
  clientId: 'conversations-service',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'conversations-service-group' });

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // 👈 ESPECIFICA EL FRONTEND
    credentials: true, // 👈 PERMITE LAS COOKIES/TOKENS
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Conectar a Kafka
async function connectKafka() {
  await producer.connect();
  await consumer.connect();
  
  // Escuchar eventos de mensajes
  await consumer.subscribe({ topic: 'message-sent', fromBeginning: true });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const messageData = JSON.parse(message.value?.toString() || '{}');
        console.log(\Processing message for conversation: \\);
        
        // Actualizar conversación cuando llega un mensaje
        await updateConversationFromMessage(messageData);
      } catch (error) {
        console.error('Error processing Kafka message:', error);
      }
    },
  });
  
  console.log('Kafka connected for conversations service');
}

async function updateConversationFromMessage(messageData: any) {
  const { senderId, receiverId } = messageData;
  
  // Buscar o crear conversación entre estos usuarios
  const participantIds = [senderId, receiverId].sort();
  
  let conversation = await prisma.conversation.findFirst({
    where: {
      participantIds: {
        equals: participantIds
      }
    }
  });
  
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participantIds,
        lastMessage: messageData.content.substring(0, 100),
        unreadCount: 1
      }
    });
    
    // Agregar participantes
    await prisma.conversationParticipant.createMany({
      data: participantIds.map(userId => ({
        conversationId: conversation.id,
        userId
      }))
    });
    
    console.log(\Created new conversation: \\);
  } else {
    // Actualizar conversación existente
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: messageData.content.substring(0, 100),
        unreadCount: { increment: 1 },
        updatedAt: new Date()
      }
    });
    
    console.log(\Updated conversation: \\);
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'conversations-service',
    timestamp: new Date().toISOString(),
    kafka: producer ? 'connected' : 'disconnected'
  });
});

// Obtener conversaciones de un usuario
app.get('/users/:userId/conversations', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: userId
        }
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        participants: {
          where: { userId: { not: userId } },
          select: { userId: true, lastSeen: true }
        }
      }
    });
    
    res.json(conversations);
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Crear conversación grupal
app.post('/conversations', async (req, res) => {
  try {
    const { participantIds, initialMessage } = req.body;
    
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 participant IDs are required' });
    }
    
    const sortedIds = [...participantIds].sort();
    
    const conversation = await prisma.conversation.create({
      data: {
        participantIds: sortedIds,
        lastMessage: initialMessage?.substring(0, 100) || 'New conversation',
        unreadCount: 0
      }
    });
    
    // Crear participantes
    await prisma.conversationParticipant.createMany({
      data: sortedIds.map(userId => ({
        conversationId: conversation.id,
        userId
      }))
    });
    
    // Publicar evento
    await producer.send({
      topic: 'conversation-created',
      messages: [
        {
          key: conversation.id,
          value: JSON.stringify({
            id: conversation.id,
            participantIds: sortedIds,
            timestamp: new Date().toISOString()
          })
        }
      ]
    });
    
    res.status(201).json(conversation);
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Marcar conversación como leída
app.put('/conversations/:conversationId/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Actualizar último visto del participante
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      },
      data: { lastSeen: new Date() }
    });
    
    // Reducir contador de no leídos
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: { decrement: 1 } }
    });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Iniciar servidor
async function startServer() {
  try {
    await connectKafka();
    
    app.listen(PORT, () => {
      console.log(\Conversations service listening on \\);
      console.log('Conversations prisma connected');
      console.log('Kafka ready for conversation events');
    });
  } catch (error) {
    console.error('Failed to start conversations service:', error);
    process.exit(1);
  }
}

startServer();
