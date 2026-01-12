import { Request, Response } from "express";
import { prisma } from "../prisma";
import { producer, REQUESTS_TOPIC } from "../kafka";

/* =========================
   CONFIG
========================= */

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATIONS_SERVICE_URL || "http://notification-service:4001";

/* =========================
   MOCK USERS
========================= */

const mockUsers: Record<string, any> = {
  cmk56lt4f0007qj55so4afsyi: {
    id: "cmk56lt4f0007qj55so4afsyi",
    name: "Usuario de Prueba",
    career: "Ingeniería en Sistemas",
    semester: 6,
    rating: 4.5,
  },
  user2: {
    id: "user2",
    name: "María García",
    career: "Ingeniería Civil",
    semester: 4,
    rating: 4.2,
  },
  user3: {
    id: "user3",
    name: "Carlos López",
    career: "Medicina",
    semester: 3,
    rating: 4.7,
  },
};

/* =========================
   HELPERS
========================= */

async function notifyUser(data: {
  type: string;
  title: string;
  message: string;
  userId: string;
  relatedId?: string;
}) {
  try {
    await fetch(`${NOTIFICATION_SERVICE_URL}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        targetUsers: [data.userId],
        senderId: "system",
      }),
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

/* =========================
   GET /user/:userId
========================= */

export async function getUserRequests(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const type = req.query.type as string | undefined;

    let where: any = {};
    if (type === "received") where = { toUserId: userId };
    else if (type === "sent") where = { fromUserId: userId };
    else where = { OR: [{ fromUserId: userId }, { toUserId: userId }] };

    const requests = await prisma.request.findMany({
      where,
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const enriched = requests.map((r) => ({
      ...r,
      fromUser: mockUsers[r.fromUserId],
      toUser: mockUsers[r.toUserId],
      messages: r.messages.map((m) => ({
        ...m,
        sender: mockUsers[m.senderId],
      })),
    }));

    return res.json({ requests: enriched });
  } catch (error) {
    console.error("getUserRequests error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/* =========================
   POST /
========================= */

export async function createRequest(req: Request, res: Response) {
  try {
    const { fromUserId, toUserId, message, type } = req.body;

    if (!fromUserId || !toUserId || !message || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ error: "Cannot send request to yourself" });
    }

    const existing = await prisma.request.findFirst({
      where: { fromUserId, toUserId, status: "PENDING" },
    });

    if (existing) {
      return res.status(400).json({ error: "Pending request already exists" });
    }

    const request = await prisma.request.create({
      data: {
        type: type.toUpperCase(),
        message,
        fromUserId,
        toUserId,
        messages: {
          create: {
            content: message,
            senderId: fromUserId,
            receiverId: toUserId,
          },
        },
      },
    });

    await producer.send({
      topic: REQUESTS_TOPIC,
      messages: [
        {
          key: request.id,
          value: JSON.stringify({ action: "request.created", request }),
        },
      ],
    });

    await notifyUser({
      type: "REQUEST_RECEIVED",
      title: "Nueva solicitud",
      message: `${
        mockUsers[fromUserId]?.name || "Un usuario"
      } te envió una solicitud`,
      userId: toUserId,
      relatedId: request.id,
    });

    return res.status(201).json({
      request: {
        ...request,
        fromUser: mockUsers[fromUserId],
        toUser: mockUsers[toUserId],
      },
    });
  } catch (error) {
    console.error("createRequest error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/* =========================
   PUT /:id/status
========================= */

export async function updateRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, userId, rating, review } = req.body;

    if (!userId || !status) {
      return res.status(400).json({ error: "userId and status required" });
    }

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: "Not found" });

    if (
      (status === "ACCEPTED" || status === "REJECTED") &&
      request.toUserId !== userId
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const data: any = { status };

    if (status === "COMPLETED") {
      data.completedAt = new Date();
      const isFrom = request.fromUserId === userId;
      if (rating) data[isFrom ? "fromUserRating" : "toUserRating"] = rating;
      if (review) data[isFrom ? "fromUserReview" : "toUserReview"] = review;
    }

    const updated = await prisma.request.update({ where: { id }, data });

    await producer.send({
      topic: REQUESTS_TOPIC,
      messages: [
        {
          key: id,
          value: JSON.stringify({
            action: "request.status_changed",
            request: updated,
          }),
        },
      ],
    });

    const targetUser =
      request.fromUserId === userId ? request.toUserId : request.fromUserId;

    await notifyUser({
      type: "REQUEST_UPDATED",
      title: "Solicitud actualizada",
      message: "El estado de una solicitud cambió",
      userId: targetUser,
      relatedId: id,
    });

    return res.json({ request: updated });
  } catch (error) {
    console.error("updateRequest error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/* =========================
   ALIASES (index.ts)
========================= */

export async function updateRequestStatus(req: Request, res: Response) {
  return updateRequest(req, res);
}

export async function completeRequest(req: Request, res: Response) {
  req.body.status = "COMPLETED";
  return updateRequest(req, res);
}

/* =========================
   GET /chat/:userId
========================= */

export async function getRequestByChat(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const otherUserId = req.query.otherUserId as string;

    if (!otherUserId) {
      return res
        .status(400)
        .json({ error: "otherUserId query param required" });
    }

    const request = await prisma.request.findFirst({
      where: {
        OR: [
          { fromUserId: userId, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: userId },
        ],
      },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!request) return res.json({ request: null });

    return res.json({
      request: {
        ...request,
        fromUser: mockUsers[request.fromUserId],
        toUser: mockUsers[request.toUserId],
        messages: request.messages.map((m) => ({
          ...m,
          sender: mockUsers[m.senderId],
        })),
      },
    });
  } catch (error) {
    console.error("getRequestByChat error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
