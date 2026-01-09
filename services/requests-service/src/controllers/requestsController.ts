import { Request, Response } from "express";
import { prisma } from "../prisma";
import { producer, REQUESTS_TOPIC } from "../kafka";

// 👇 CORRECCIÓN APLICADA: Default a notification-service
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATIONS_SERVICE_URL || "http://notification-service:4001";
const RATINGS_SERVICE_URL =
  process.env.RATINGS_SERVICE_URL || "http://ratings-service:4006";

// Datos mock para usuarios
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

// Helper para enviar notificaciones
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

// GET /requests - Listar solicitudes (VERSIÓN CON MOCK)
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

    // Obtener requests SIN relaciones
    const requests = await prisma.request.findMany({
      where: whereCondition,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Enriquecer con datos mock de usuarios
    const enrichedRequests = requests.map((request) => {
      const messagesWithSenders =
        request.messages?.map((message) => ({
          ...message,
          sender: mockUsers[message.senderId] || {
            id: message.senderId,
            name: `Usuario ${message.senderId.substring(0, 8)}`,
          },
        })) || [];

      return {
        ...request,
        fromUser: mockUsers[request.fromUserId] || {
          id: request.fromUserId,
          name: `Usuario ${request.fromUserId.substring(0, 8)}`,
          career: "No especificada",
          semester: 0,
          rating: 0,
        },
        toUser: mockUsers[request.toUserId] || {
          id: request.toUserId,
          name: `Usuario ${request.toUserId.substring(0, 8)}`,
          career: "No especificada",
          semester: 0,
          rating: 0,
        },
        messages: messagesWithSenders,
      };
    });

    return res.json({ requests: enrichedRequests });
  } catch (error) {
    console.error("Error in getRequests", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// POST /requests - Crear nueva solicitud (VERSIÓN CON MOCK)
export async function createRequest(req: Request, res: Response) {
  try {
    const { fromUserId, toUserId, message, type } = req.body;

    if (!fromUserId || !toUserId || !message || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ error: "Cannot send request to yourself" });
    }

    // Verificar si ya existe una solicitud pendiente
    const existing = await prisma.request.findFirst({
      where: { fromUserId, toUserId, status: "PENDING" },
    });

    if (existing) {
      return res.status(400).json({ error: "Pending request already exists" });
    }

    // Crear solicitud SIN relaciones
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
    });

    // Publicar evento en Kafka
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

    // Enviar notificación al receptor
    await notifyUser({
      type: "REQUEST_RECEIVED",
      title: "Nueva solicitud recibida",
      message: `${
        mockUsers[fromUserId]?.name || "Un usuario"
      } te envió una solicitud de ${type}`,
      userId: toUserId,
      relatedId: newRequest.id,
    });

    // Retornar con datos mock
    const requestWithUsers = {
      ...newRequest,
      fromUser: mockUsers[fromUserId] || {
        id: fromUserId,
        name: `Usuario ${fromUserId.substring(0, 8)}`,
      },
      toUser: mockUsers[toUserId] || {
        id: toUserId,
        name: `Usuario ${toUserId.substring(0, 8)}`,
      },
    };

    return res.status(201).json({ request: requestWithUsers });
  } catch (error) {
    console.error("Error in createRequest", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// GET /requests/:id - Obtener detalle de una solicitud (VERSIÓN CON MOCK)
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
        messages: true,
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Seguridad: Solo el emisor o receptor pueden verla
    if (request.fromUserId !== userId && request.toUserId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Enriquecer mensajes con datos de sender
    const enrichedMessages =
      request.messages?.map((message) => ({
        ...message,
        sender: mockUsers[message.senderId] || {
          id: message.senderId,
          name: `Usuario ${message.senderId.substring(0, 8)}`,
        },
      })) || [];

    const enrichedRequest = {
      ...request,
      fromUser: mockUsers[request.fromUserId] || {
        id: request.fromUserId,
        name: `Usuario ${request.fromUserId.substring(0, 8)}`,
        career: "No especificada",
      },
      toUser: mockUsers[request.toUserId] || {
        id: request.toUserId,
        name: `Usuario ${request.toUserId.substring(0, 8)}`,
        career: "No especificada",
      },
      messages: enrichedMessages,
    };

    return res.json({ request: enrichedRequest });
  } catch (error) {
    console.error("Error in getRequestById", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// GET /user/:userId - Obtener solicitudes de un usuario (VERSIÓN CON MOCK)
export async function getUserRequests(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const type = req.query.type as string | undefined;

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
        messages: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Enriquecer con datos mock
    const enrichedRequests = requests.map((request) => {
      const enrichedMessages =
        request.messages?.map((message) => ({
          ...message,
          sender: mockUsers[message.senderId] || {
            id: message.senderId,
            name: `Usuario ${message.senderId.substring(0, 8)}`,
          },
        })) || [];

      return {
        ...request,
        fromUser: mockUsers[request.fromUserId] || {
          id: request.fromUserId,
          name: `Usuario ${request.fromUserId.substring(0, 8)}`,
          career: "No especificada",
          semester: 0,
          rating: 0,
        },
        toUser: mockUsers[request.toUserId] || {
          id: request.toUserId,
          name: `Usuario ${request.toUserId.substring(0, 8)}`,
          career: "No especificada",
          semester: 0,
          rating: 0,
        },
        messages: enrichedMessages,
      };
    });

    return res.json({ requests: enrichedRequests });
  } catch (error) {
    console.error("Error in getUserRequests", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// Las otras funciones (updateRequest, updateRequestStatus, completeRequest, etc.)
// se mantienen igual, pero QUITA las relaciones en los includes

// PUT /requests/:id - Actualizar estado
export async function updateRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, userId, rating, review } = req.body;

    if (!userId || !status) {
      return res.status(400).json({ error: "userId and status are required" });
    }

    // Obtener solicitud SIN relaciones
    const request = await prisma.request.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Regla: Solo el receptor puede aceptar o rechazar
    if (status === "ACCEPTED" || status === "REJECTED") {
      if (request.toUserId !== userId) {
        return res
          .status(403)
          .json({ error: "Only receiver can accept/reject" });
      }
    }

    const updateData: any = { status };

    // Si se completa, guardamos ratings si vienen incluidos
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

    // Kafka: Evento de cambio de estado
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

    // Enviar notificación a la contraparte
    const notificationUserId =
      request.fromUserId === userId ? request.toUserId : request.fromUserId;

    let notifType = "REQUEST_UPDATED";
    let notifMsg = "Tu solicitud fue actualizada";

    if (status === "ACCEPTED") {
      notifType = "REQUEST_ACCEPTED";
      notifMsg = `${
        mockUsers[request.fromUserId]?.name || "Un usuario"
      } aceptó tu solicitud`;
    } else if (status === "REJECTED") {
      notifType = "REQUEST_REJECTED";
      notifMsg = `${
        mockUsers[request.fromUserId]?.name || "Un usuario"
      } rechazó tu solicitud`;
    } else if (status === "COMPLETED") {
      notifType = "REQUEST_COMPLETED";
      notifMsg = `${
        mockUsers[request.fromUserId]?.name || "Un usuario"
      } marcó el proyecto como completado`;
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

// Para las otras funciones (completeRequest, getRequestByChat, etc.),
// solo necesitas QUITAR las relaciones que intentas incluir

// DELETE /requests/:id - Eliminar solicitud
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

    // Solo el creador puede eliminar
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
