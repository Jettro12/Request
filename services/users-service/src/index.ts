import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4007;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // Permite ambos orígenes
    credentials: true, // ¡Esto es lo importante! Permite cookies/headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", service: "users-service" });
});

// Obtener todos los usuarios
app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Obtener usuario por ID
app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Actualizar usuario
app.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { name, image },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Obtener conversaciones (SQL corregido y limpio)
app.get("/users/:userId/conversations", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Usamos backticks estándar. Si falla, es por caracteres invisibles al copiar.
    const conversations = await prisma.$queryRaw`
      SELECT DISTINCT ON (contact_id) 
        m.id,
        m.content,
        m.created_at,
        m.is_read,
        m.sender_id,
        m.receiver_id,
        CASE 
          WHEN m.sender_id = ${userId} THEN m.receiver_id
          ELSE m.sender_id
        END as contact_id
      FROM messages m
      WHERE m.sender_id = ${userId} OR m.receiver_id = ${userId}
      ORDER BY contact_id, m.created_at DESC
    `;

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    // Devolvemos array vacío si falla la base de datos (ej. tabla no existe aún)
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Users service running on port ${PORT}`);
});
