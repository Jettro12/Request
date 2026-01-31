import bcrypt from 'bcryptjs';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { prisma } from './prisma'; // Tu instancia de prisma
import { Prisma } from '@prisma/client';
import { eventPublisher } from '../events/publisher'; // Ajusta la ruta

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4004');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_cambiame';

// =========================
// REDIS CONFIG
// =========================
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

redis.on('connect', () => console.log('✅ Auth Service conectado a Redis'));
redis.on('error', (err) => console.error('❌ Error en Redis:', err));

// =========================
// MIDDLEWARES
// =========================
const allowedOrigins = (process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:3000',
]) as string[];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());

// Middleware para verificar JWT
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ error: 'Token no válido o expirado' });
    (req as any).user = user;
    next();
  });
};

// =========================
// RUTAS
// =========================

// 1. REGISTRO
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

    // Publicar evento (Async)
    eventPublisher
      .publishUserCreated({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: new Date(),
      })
      .catch((err) => console.error('Error publicando evento:', err));

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: 'Error interno' });
  }
});

// 2. LOGIN (Cache-Aside + JWT)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Faltan credenciales' });

  try {
    let user: any;

    // Intentar obtener de Redis
    const cachedUser = await redis.get(`user:login:${email}`);

    if (cachedUser) {
      console.log('⚡ LOGIN: Cache Hit');
      user = JSON.parse(cachedUser);
    } else {
      console.log('💾 LOGIN: Cache Miss');
      user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        // Guardar en cache por 10 minutos (600s)
        await redis.set(`user:login:${email}`, JSON.stringify(user), 'EX', 600);
      }
    }

    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Validar Password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(401).json({ error: 'Credenciales inválidas' });

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' },
    );

    const { password: _, ...userSafe } = user;
    res.json({ user: userSafe, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// 3. LOGOUT (Invalida cache opcionalmente)
app.post('/logout', async (req, res) => {
  const { email } = req.body;
  if (email) await redis.del(`user:login:${email}`);
  res.json({ success: true, message: 'Sesión cerrada' });
});

// 4. PERFIL (Ruta Protegida)
app.get('/me', authenticateToken, async (req: any, res) => {
  res.json({ user: req.user });
});

// 5. HEALTH
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    redis: redis.status,
    db: 'connected',
  });
});

// =========================
// START
// =========================
async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected');

    app.listen(PORT, '0.0.0.0', () =>
      console.log(`🚀 Auth service en puerto ${PORT}`),
    );
  } catch (err) {
    console.error('❌ Error fatal al iniciar:', err);
    process.exit(1);
  }
}

start();
