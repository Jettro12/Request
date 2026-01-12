import { Request, Response } from "express";
import { prisma } from "../prisma";

// ================= POST / =================
// Crear notificación
export async function sendNotification(req: Request, res: Response) {
  try {
    const { userId, type, title, message, relatedId } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId,
      },
    });

    return res.status(201).json({ notification });
  } catch (error) {
    console.error("Error in sendNotification", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ================= GET / =================
// Obtener notificaciones de un usuario
export async function getUserNotifications(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string | undefined;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ notifications });
  } catch (error) {
    console.error("Error in getUserNotifications", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ================= PATCH / =================
// Marcar todas como leídas
export async function markAllAsRead(req: Request, res: Response) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error in markAllAsRead", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ================= PATCH /:id =================
// Marcar una notificación como leída
export async function markAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return res.json({ notification });
  } catch (error) {
    console.error("Error in markAsRead", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
