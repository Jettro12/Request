import { Request, Response } from "express";
import { prisma } from "../prisma";
import { producer, NOTIFICATION_TOPIC } from "../kafka";

// POST /notifications
export async function sendNotification(req: Request, res: Response) {
  try {
    const {
      type,
      title,
      message,
      relatedId,
      targetUsers,
      targetCareer,
      senderId,
    } = req.body;

    if (!type || !title || !message) {
      return res
        .status(400)
        .json({ error: "type, title and message are required" });
    }

    let userIds: string[] = [];

    if (Array.isArray(targetUsers) && targetUsers.length > 0) {
      userIds = targetUsers;
    } else if (targetCareer) {
      const users = await prisma.user.findMany({
        where: { career: targetCareer },
        select: { id: true },
      });
      userIds = users.map((u) => u.id).filter((id) => id !== senderId);
    } else if (senderId) {
      userIds = [senderId];
    } else {
      return res
        .status(400)
        .json({ error: "No targetUsers or targetCareer or senderId provided" });
    }

    if (userIds.length === 0) {
      return res.json({
        success: true,
        message: "No users to notify",
        notifications: [],
      });
    }

    const created = await Promise.all(
      userIds.map((userId) =>
        prisma.notification.create({
          data: {
            type,
            userId,
            title,
            message,
            relatedId: relatedId || null,
            senderId: type !== "SYSTEM" ? senderId || null : null,
          },
          include: { user: { select: { id: true, name: true, email: true } } },
        })
      )
    );

    // publish events to kafka
    await Promise.all(
      created.map((notification) =>
        producer.send({
          topic: NOTIFICATION_TOPIC,
          messages: [
            {
              key: notification.userId,
              value: JSON.stringify({ action: "create", notification }),
            },
          ],
        })
      )
    );

    return res.json({ notifications: created });
  } catch (error) {
    console.error("Error in sendNotification", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// GET /notifications?userId=&limit=&unreadOnly=
export async function getUserNotifications(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string | undefined;
    const limit = parseInt((req.query.limit as string) || "50");
    const unreadOnly = (req.query.unreadOnly as string) === "true";

    if (!userId) return res.status(400).json({ error: "userId is required" });

    const where: any = { userId };
    if (unreadOnly) where.read = false;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return res.json({ notifications });
  } catch (error) {
    console.error("Error in getUserNotifications", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// PATCH /notifications  -> mark all as read for userId in body
export async function markAllAsRead(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    // Publish kafka event
    await producer.send({
      topic: NOTIFICATION_TOPIC,
      messages: [
        {
          key: "mark_all_read",
          value: JSON.stringify({
            action: "mark_all_read",
            userId,
            count: result.count,
          }),
        },
      ],
    });

    return res.json({ success: true, count: result.count });
  } catch (error) {
    console.error("Error in markAllAsRead", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// PATCH /notifications/:id -> mark single as read
export async function markAsRead(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "id is required" });

    const notification = await prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) return res.status(404).json({ error: "Not found" });

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    await producer.send({
      topic: NOTIFICATION_TOPIC,
      messages: [
        {
          key: "update",
          value: JSON.stringify({
            action: "update",
            notificationId: id,
            userId: updated.userId,
            read: true,
          }),
        },
      ],
    });

    return res.json({ success: true, notification: updated });
  } catch (error) {
    console.error("Error in markAsRead", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
