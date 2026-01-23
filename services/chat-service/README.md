# 💬 Chat Service

**Servicio de chat en tiempo real. Implementa WebSocket para comunicación instantánea entre usuarios.**

---

## 📋 Descripción

El **Chat Service** es responsable de:

- ✅ Conexiones WebSocket en tiempo real
- ✅ Broadcast de mensajes entre usuarios
- ✅ Manejo de salas/canales de chat
- ✅ Notificación de usuarios conectados
- ✅ Historial de conversaciones

---

## 🛠️ Stack Tecnológico

- **Express.js 4.22** - Framework HTTP
- **TypeScript 5.5** - Type safety
- **Socket.IO** - WebSocket communication
- **Node.js 20+** - Runtime

---

## 🏃 Ejecución

### Desarrollo
```bash
npm install
npm run dev
```

Accesible en: `http://localhost:4010`

### Producción
```bash
npm run build
npm start
```

---

## 🔌 WebSocket Events

### Client → Server

**join-room**
```javascript
socket.emit('join-room', {
  roomId: 'request_id_aqui',
  userId: 'cmk56lt4f0007qj55so4afsyi',
  userName: 'Juan Pérez'
});
```

**send-message**
```javascript
socket.emit('send-message', {
  roomId: 'request_id_aqui',
  userId: 'cmk56lt4f0007qj55so4afsyi',
  userName: 'Juan Pérez',
  message: 'Hola, cómo estás?',
  timestamp: new Date().toISOString()
});
```

**typing**
```javascript
socket.emit('typing', {
  roomId: 'request_id_aqui',
  userId: 'cmk56lt4f0007qj55so4afsyi',
  userName: 'Juan Pérez'
});
```

**stop-typing**
```javascript
socket.emit('stop-typing', {
  roomId: 'request_id_aqui',
  userId: 'cmk56lt4f0007qj55so4afsyi'
});
```

**leave-room**
```javascript
socket.emit('leave-room', {
  roomId: 'request_id_aqui',
  userId: 'cmk56lt4f0007qj55so4afsyi'
});
```

### Server → Client

**message-received**
```javascript
socket.on('message-received', {
  roomId: 'request_id_aqui',
  userId: 'cmk56lt4f0007qj55so4afsyi',
  userName: 'Juan Pérez',
  message: 'Hola, cómo estás?',
  timestamp: '2024-01-20T10:30:00Z'
});
```

**user-joined**
```javascript
socket.on('user-joined', {
  roomId: 'request_id_aqui',
  userId: 'cmk56lt4f0007qj55so4afsyi',
  userName: 'Juan Pérez',
  usersInRoom: ['user1', 'user2', 'user3']
});
```

**user-left**
```javascript
socket.on('user-left', {
  roomId: 'request_id_aqui',
  userId: 'cmk56lt4f0007qj55so4afsyi',
  userName: 'Juan Pérez',
  usersInRoom: ['user1', 'user2']
});
```

**user-typing**
```javascript
socket.on('user-typing', {
  roomId: 'request_id_aqui',
  userId: 'cmk56lt4f0007qj55so4afsyi',
  userName: 'Juan Pérez'
});
```

**user-stop-typing**
```javascript
socket.on('user-stop-typing', {
  roomId: 'request_id_aqui',
  userId: 'cmk56lt4f0007qj55so4afsyi'
});
```

**error**
```javascript
socket.on('error', {
  message: 'Error message here'
});
```

---

## 📝 Ejemplo de Uso (Frontend)

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4010', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

useEffect(() => {
  socket.emit('join-room', {
    roomId: requestId,
    userId: currentUserId,
    userName: currentUserName
  });

  socket.on('message-received', (data) => {
    console.log('New message:', data);
    setMessages([...messages, data]);
  });

  return () => {
    socket.emit('leave-room', {
      roomId: requestId,
      userId: currentUserId
    });
    socket.disconnect();
  };
}, [requestId]);

const sendMessage = (text: string) => {
  socket.emit('send-message', {
    roomId: requestId,
    userId: currentUserId,
    userName: currentUserName,
    message: text,
    timestamp: new Date().toISOString()
  });
};
```

---

## 📊 Estructura de Datos

**Room:**
```typescript
{
  roomId: string;
  createdAt: Date;
  users: User[];
  messages: Message[];
}

interface User {
  userId: string;
  userName: string;
  socketId: string;
  joinedAt: Date;
  isTyping: boolean;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}
```

---

## 📊 Variables de Entorno

```env
# Servidor
PORT=4010
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Socket.IO
SOCKET_TIMEOUT=60000
SOCKET_PING_INTERVAL=25000
```

---

## 🔐 Consideraciones de Seguridad

- ✅ Validar que usuario pertenece a la sala
- ✅ Rate limiting en messages
- ✅ Sanitizar contenido de mensajes
- ✅ Logging de eventos importantes

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 🔗 Enlaces Relacionados

- [README Principal](../../README.md)
- [Requests Service](../requests-service/README.md)
- [Messages Service](../messages-service/README.md)

---

**Última actualización:** Enero 2026
