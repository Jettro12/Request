import bcrypt from 'bcryptjs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './prisma';
import { Prisma } from '@prisma/client';
import Redis from 'ioredis';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4004');
const app = express();

// Conexión a Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log('✅ Auth Service conectado a Redis con éxito');
});

redis.on('error', (err) => {
  console.error('❌ Error crítico en Redis:', err);
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'http://frontend:3000',
      'http://app-alb-896588448.us-east-1.elb.amazonaws.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());

// REGISTRO DE USUARIOS
app.post('/register', async (req, res) => {
  const { name, email, password, career, semester, bio } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        career,
        semester: semester ? Number(semester) : null,
        bio: bio || '',
        role: 'user',
      },
    });

    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }
    }
    console.error('Error en register:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// LOGIN CON ESTRATEGIA CACHE-ASIDE (REDIS)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'missing credentials' });
  }

  try {
    // 1. Verificar si el usuario está en la caché de Redis
    const cachedUser = await redis.get(`user:login:${email}`);

    if (cachedUser) {
      console.log('⚡ LOGIN: Cache Hit (Redis)');
      const user = JSON.parse(cachedUser);
      const isValid = await bcrypt.compare(password, user.password || '');

      if (!isValid) return res.status(401).json({ error: 'invalid' });

      const { password: _, ...userSafe } = user;
      return res.json({ user: userSafe });
    }

    // 2. Si no hay caché, buscar en PostgreSQL
    console.log('💾 LOGIN: Cache Miss (Consultando DB)');
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(401).json({ error: 'invalid' });

    const isValid = await bcrypt.compare(password, user.password || '');
    if (!isValid) return res.status(401).json({ error: 'invalid' });

    // 3. Guardar en Redis para futuras peticiones (Expira en 10 minutos)
    await redis.set(`user:login:${email}`, JSON.stringify(user), 'EX', 600);

    const { password: _, ...userNoPass } = user;
    res.json({ user: userNoPass });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/logout', async (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'auth-service',
    db: prisma ? 'connected' : 'error',
    redis: redis.status,
  });
});

async function start() {
  app.listen(PORT, '0.0.0.0', () =>
    console.log(`Auth service running on port ${PORT}`),
  );

  try {
    await prisma.$connect();
    console.log('Auth prisma connected');
  } catch (err) {
    console.error('Prisma connection failed', err);
  }
}

start().catch((err) => {
  console.error('Fatal Auth Error', err);
  process.exit(1);
});
