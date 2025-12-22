import { Request, Response } from "express";
import { prisma } from "../prisma";
import { producer, REQUESTS_TOPIC } from "../kafka";

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATIONS_SERVICE_URL || "http://localhost:4001";

// Helper to send notification event to notification service
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

// GET /requests - list requests for user
export async function getRequests(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string | undefined;
    const type = req.query.type as string | undefined;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    let whereCondition: any = {};
    if (type === "received") {
      whereCondition = { toUserId: userId };
    } else if (type === "sent") {
      whereCondition = { fromUserId: userId };
    } else {
      whereCondition = { OR: [{ toUserId: userId }, { fromUserId: userId }] };
    }

    const requests = await prisma.request.findMany({
      where: whereCondition,
      include: {
        fromUser: {
          select: { id: true, name: true, career: true, rating: true },
        },
        toUser: {
          select: { id: true, name: true, career: true, rating: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.json({ requests });
  } catch (error) {
    console.error("Error in getRequests", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// POST /requests - create new request
export async function createRequest(req: Request, res: Response) {
  try {
    const { fromUserId, toUserId, message, type } = req.body;

    if (!fromUserId || !toUserId || !message || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ error: "Cannot send request to yourself" });
    }

    // Check if pending request already exists
    const existing = await prisma.request.findFirst({
      where: { fromUserId, toUserId, status: "PENDING" },
    });

    if (existing) {
      return res.status(400).json({ error: "Pending request already exists" });
    }

    const newRequest = await prisma.request.create({
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
      include: {
        fromUser: { select: { id: true, name: true } },
        toUser: { select: { id: true, name: true } },
      },
    });

    // Publish event to Kafka
    await producer.send({
      topic: REQUESTS_TOPIC,
      messages: [
        {
          key: newRequest.id,
          value: JSON.stringify({
            action: "request.created",
            request: newRequest,
          }),
        },
      ],
    });

    // Send notification
    await notifyUser({
      type: "REQUEST_RECEIVED",
      title: "Nueva solicitud recibida",
      message: `${newRequest.fromUser.name} te envió una solicitud de ${type}`,
      userId: toUserId,
      relatedId: newRequest.id,
    });

    return res.status(201).json({ request: newRequest });
  } catch (error) {
    console.error("Error in createRequest", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// GET /requests/:id - get single request
export async function getRequestById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string | undefined;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        fromUser: { select: { id: true, name: true, career: true } },
        toUser: { select: { id: true, name: true, career: true } },
        messages: { include: { sender: { select: { id: true, name: true } } } },
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.fromUserId !== userId && request.toUserId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    return res.json({ request });
  } catch (error) {
    console.error("Error in getRequestById", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// PUT /requests/:id - update request (accept/reject/complete)
export async function updateRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, userId, rating, review } = req.body;

    if (!userId || !status) {
      return res.status(400).json({ error: "userId and status are required" });
    }

    const request = await prisma.request.findUnique({
      where: { id },
      include: { fromUser: true, toUser: true },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Authorization checks
    if (status === "ACCEPTED" || status === "REJECTED") {
      if (request.toUserId !== userId) {
        return res
          .status(403)
          .json({ error: "Only receiver can accept/reject" });
      }
    }

    const updateData: any = { status };

    if (status === "COMPLETED") {
      updateData.completedAt = new Date();
      const isFromUser = request.fromUserId === userId;
      if (rating) {
        updateData[isFromUser ? "fromUserRating" : "toUserRating"] = rating;
      }
      if (review) {
        updateData[isFromUser ? "fromUserReview" : "toUserReview"] = review;
      }
    }

    const updated = await prisma.request.update({
      where: { id },
      data: updateData,
    });

    // Publish event to Kafka
    await producer.send({
      topic: REQUESTS_TOPIC,
      messages: [
        {
          key: id,
          value: JSON.stringify({
            action: "request.status_changed",
            request: updated,
            newStatus: status,
          }),
        },
      ],
    });

    // Send notification
    const notificationUserId =
      request.fromUserId === userId ? request.toUserId : request.fromUserId;
    let notifType = "REQUEST_UPDATED";
    let notifMsg = "Tu solicitud fue actualizada";

    if (status === "ACCEPTED") {
      notifType = "REQUEST_ACCEPTED";
      notifMsg = `${request.fromUser.name} aceptó tu solicitud`;
    } else if (status === "REJECTED") {
      notifType = "REQUEST_REJECTED";
      notifMsg = `${request.fromUser.name} rechazó tu solicitud`;
    } else if (status === "COMPLETED") {
      notifType = "REQUEST_COMPLETED";
      notifMsg = `${request.fromUser.name} marcó el proyecto como completado`;
    }

    await notifyUser({
      type: notifType,
      title: "Actualización de solicitud",
      message: notifMsg,
      userId: notificationUserId,
      relatedId: id,
    });

    return res.json({ success: true, request: updated });
  } catch (error) {
    console.error("Error in updateRequest", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// DELETE /requests/:id
export async function deleteRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const request = await prisma.request.findUnique({ where: { id } });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.fromUserId !== userId) {
      return res.status(403).json({ error: "Only creator can delete" });
    }

    await prisma.request.delete({ where: { id } });

    return res.json({ success: true, message: "Request deleted" });
  } catch (error) {
    console.error("Error in deleteRequest", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
