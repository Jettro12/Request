import { Request, Response } from "express";
import { prisma } from "../prisma";
import { getProducer, REQUESTS_TOPIC } from "../kafka";

/* =========================
   CONFIG
========================= */

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATIONS_SERVICE_URL || "http://notification-service:4001";

// Configuración de tipos de solicitud válidos
const VALID_REQUEST_TYPES = [
  "COLLABORATION",
  "TUTORING",
  "PROJECT",
  "OTHER",
  "HELP",
  "ADVICE",
];

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

// Helper para obtener usuario mock o default
function getUserInfo(userId: string) {
  return (
    mockUsers[userId] || {
      id: userId,
      name: `Usuario ${userId.substring(0, 8)}`,
      career: "No especificada",
      semester: 0,
      rating: 0,
    }
  );
}

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
    const response = await fetch(`${NOTIFICATION_SERVICE_URL}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        targetUsers: [data.userId],
        senderId: "system",
        createdAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.warn(
        `Notification service returned ${response.status}: ${await response.text()}`,
      );
    } else {
      console.log(`Notification sent to user ${data.userId}: ${data.type}`);
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

async function sendToKafka(topic: string, key: string, value: any) {
  try {
    const kafkaProducer = await getProducer();

    await kafkaProducer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify({
            ...value,
            timestamp: new Date().toISOString(),
            service: "requests-service",
          }),
        },
      ],
    });

    console.log(`✅ Kafka event sent to ${topic}: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send Kafka event to ${topic}:`, error);
    return false;
  }
}

/* =========================
   GET /user/:userId
========================= */

export async function getUserRequests(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const type = req.query.type as string | undefined;

    console.log(`Fetching requests for user ${userId}, type: ${type || "all"}`);

    // Validar userId
    if (!userId || userId === "undefined") {
      return res.status(400).json({
        error: "Invalid user ID",
        message: "User ID is required and cannot be 'undefined'",
      });
    }

    let where: any = {};
    if (type === "received") {
      where = { toUserId: userId };
    } else if (type === "sent") {
      where = { fromUserId: userId };
    } else {
      where = {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      };
    }

    // Consultar solicitudes
    const requests = await prisma.request.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    // Obtener mensajes para cada solicitud
    const requestsWithMessages = [];

    for (const request of requests) {
      // PRUEBA: Ver qué nombres de modelo están disponibles
      console.log("Prisma model names:", Object.keys(prisma));

      // Intenta con ambos nombres
      let messages: any[] = [];
      try {
        // Primero intenta con 'message' (minúscula)
        messages = await (prisma as any).message.findMany({
          where: { requestId: request.id },
          orderBy: { createdAt: "asc" },
          take: 10,
        });
      } catch (e1) {
        try {
          // Luego intenta con 'Message' (mayúscula)
          messages = await (prisma as any).Message.findMany({
            where: { requestId: request.id },
            orderBy: { createdAt: "asc" },
            take: 10,
          });
        } catch (e2) {
          console.error("Could not find messages model:", e2);
          messages = [];
        }
      }

      requestsWithMessages.push({
        ...request,
        messages: messages.map((m: any) => ({
          ...m,
          sender: getUserInfo(m.senderId),
        })),
        fromUser: getUserInfo(request.fromUserId),
        toUser: getUserInfo(request.toUserId),
        _count: {
          messages: messages.length,
        },
      });
    }

    return res.json({
      success: true,
      requests: requestsWithMessages,
      count: requestsWithMessages.length,
      userId,
      type: type || "all",
    });
  } catch (error) {
    console.error("getUserRequests error", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/* =========================
   POST / - Crear solicitud
========================= */

export async function createRequest(req: Request, res: Response) {
  try {
    console.log("Creating new request with data:", req.body);

    const { fromUserId, toUserId, message, type = "COLLABORATION" } = req.body;

    // Validaciones
    if (!fromUserId || !toUserId || !message) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["fromUserId", "toUserId", "message"],
        received: { fromUserId, toUserId, message, type },
      });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({
        error: "Cannot send request to yourself",
        message: "You cannot send a request to yourself",
      });
    }

    const uppercaseType = type.toUpperCase();
    if (!VALID_REQUEST_TYPES.includes(uppercaseType)) {
      return res.status(400).json({
        error: "Invalid request type",
        validTypes: VALID_REQUEST_TYPES,
        received: type,
      });
    }

    // Verificar si ya existe una solicitud pendiente
    const existing = await prisma.request.findFirst({
      where: {
        fromUserId,
        toUserId,
        status: "PENDING",
      },
    });

    if (existing) {
      return res.status(400).json({
        error: "Pending request already exists",
        existingRequestId: existing.id,
        message: "There is already a pending request between these users",
      });
    }

    // Crear la solicitud
    const request = await prisma.request.create({
      data: {
        type: uppercaseType,
        message: message.trim(),
        fromUserId,
        toUserId,
        status: "PENDING",
      },
    });

    // Crear mensaje inicial - prueba ambos nombres
    try {
      // Primero intenta con 'message'
      await (prisma as any).message.create({
        data: {
          content: message.trim(),
          senderId: fromUserId,
          receiverId: toUserId,
          requestId: request.id,
        },
      });
    } catch (e1) {
      try {
        // Luego intenta con 'Message'
        await (prisma as any).Message.create({
          data: {
            content: message.trim(),
            senderId: fromUserId,
            receiverId: toUserId,
            requestId: request.id,
          },
        });
      } catch (e2) {
        console.error("Could not create message:", e2);
        // Continuar aunque falle el mensaje
      }
    }

    console.log(`Request created: ${request.id}`);

    // Enviar evento a Kafka
    try {
      await sendToKafka(REQUESTS_TOPIC, request.id, {
        action: "request.created",
        request: {
          id: request.id,
          type: request.type,
          status: request.status,
          fromUserId: request.fromUserId,
          toUserId: request.toUserId,
          createdAt: request.createdAt,
        },
      });
    } catch (kafkaError) {
      console.warn("Kafka event failed, but request was created:", kafkaError);
    }

    // Enviar notificación
    try {
      const fromUser = getUserInfo(fromUserId);
      await notifyUser({
        type: "REQUEST_RECEIVED",
        title: "📩 Nueva solicitud",
        message: `${fromUser.name} te envió una solicitud de ${request.type.toLowerCase()}`,
        userId: toUserId,
        relatedId: request.id,
      });
    } catch (notifyError) {
      console.warn("Notification failed:", notifyError);
    }

    // Respuesta exitosa
    return res.status(201).json({
      success: true,
      message: "Request created successfully",
      request: {
        ...request,
        fromUser: getUserInfo(fromUserId),
        toUser: getUserInfo(toUserId),
      },
    });
  } catch (error) {
    console.error("createRequest error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        error instanceof Error ? error.message : "Failed to create request",
    });
  }
}

/* =========================
   PUT /:id/status - Actualizar estado
========================= */

export async function updateRequest(req: Request, res: Response) {
  console.log("Available Prisma models:", Object.keys(prisma));
  console.log("Prisma object:", prisma);
  try {
    const { id } = req.params;
    const { status, userId, rating, review } = req.body;

    console.log(`Updating request ${id} to status ${status} by user ${userId}`);

    if (!userId || !status) {
      return res.status(400).json({
        error: "userId and status required",
        received: { userId, status, rating, review },
      });
    }

    // Validar estado
    const validStatuses = [
      "PENDING",
      "ACCEPTED",
      "REJECTED",
      "COMPLETED",
      "CANCELLED",
    ];
    const statusUpper = status.toUpperCase();

    if (!validStatuses.includes(statusUpper)) {
      return res.status(500).json({
        error: "Invalid status",
        validStatuses,
        received: status,
      });
    }

    // Buscar la solicitud
    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({
        error: "Request not found",
        requestId: id,
      });
    }

    // Validar permisos
    if (
      (statusUpper === "ACCEPTED" || statusUpper === "REJECTED") &&
      request.toUserId !== userId
    ) {
      return res.status(403).json({
        error: "Not authorized",
        message: "Only the recipient can accept or reject a request",
        requiredUserId: request.toUserId,
        yourUserId: userId,
      });
    }

    // Preparar datos de actualización
    const updateData: any = {
      status: statusUpper,
      updatedAt: new Date(),
    };

    if (statusUpper === "COMPLETED") {
      updateData.completedAt = new Date();
      const isFrom = request.fromUserId === userId;

      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return res.status(400).json({
            error: "Invalid rating",
            message: "Rating must be between 1 and 5",
            received: rating,
          });
        }
        updateData[isFrom ? "fromUserRating" : "toUserRating"] = rating;
      }

      if (review !== undefined) {
        updateData[isFrom ? "fromUserReview" : "toUserReview"] = review.trim();
      }
    }

    // Actualizar la solicitud
    const updated = await prisma.request.update({
      where: { id },
      data: updateData,
    });

    console.log(`Request ${id} updated to ${updated.status}`);

    // Enviar evento a Kafka
    try {
      await sendToKafka(REQUESTS_TOPIC, id, {
        action: "request.status_changed",
        oldStatus: request.status,
        newStatus: updated.status,
        request: updated,
        changedBy: userId,
      });
    } catch (kafkaError) {
      console.warn("Kafka event failed:", kafkaError);
    }

    // Enviar notificación al otro usuario
    const targetUser =
      request.fromUserId === userId ? request.toUserId : request.fromUserId;
    try {
      const statusMessages: Record<string, string> = {
        ACCEPTED: "✅ aceptó",
        REJECTED: "❌ rechazó",
        COMPLETED: "🏁 completó",
        CANCELLED: "🚫 canceló",
      };

      const actionMessage = statusMessages[statusUpper] || "actualizó";

      await notifyUser({
        type: `REQUEST_${statusUpper}`,
        title: `Solicitud ${status.toLowerCase()}`,
        message: `El usuario ${getUserInfo(userId).name} ${actionMessage} tu solicitud`,
        userId: targetUser,
        relatedId: id,
      });
    } catch (notifyError) {
      console.warn("Notification failed:", notifyError);
    }

    return res.json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      request: updated,
    });
  } catch (error) {
    console.error("updateRequest error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        error instanceof Error ? error.message : "Failed to update request",
    });
  }
}

/* =========================
   ALIASES
========================= */

export async function updateRequestStatus(req: Request, res: Response) {
  return updateRequest(req, res);
}

export async function completeRequest(req: Request, res: Response) {
  // Crear una copia del request con el status actualizado
  const modifiedRequest = {
    ...req,
    body: {
      ...req.body,
      status: "COMPLETED",
    },
  };

  // Llamar a updateRequest con el request modificado
  return updateRequest(modifiedRequest as Request, res);
}

/* =========================
   GET /chat/:userId - Obtener solicitud por chat
========================= */

export async function getRequestByChat(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const otherUserId = req.query.otherUserId as string;

    console.log(`Getting chat request between ${userId} and ${otherUserId}`);

    // Validaciones
    if (!userId || userId === "undefined") {
      return res.status(400).json({
        error: "Invalid user ID",
        message: "User ID is required and cannot be 'undefined'",
      });
    }

    if (!otherUserId || otherUserId === "undefined") {
      return res.status(400).json({
        error: "otherUserId query param required",
        message: "You must provide otherUserId as a query parameter",
      });
    }

    if (userId === otherUserId) {
      return res.status(400).json({
        error: "Same user ID",
        message: "Cannot get chat request with yourself",
      });
    }

    // Buscar solicitud entre los usuarios
    const request = await prisma.request.findFirst({
      where: {
        OR: [
          { fromUserId: userId, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: userId },
        ],
      },
    });

    if (!request) {
      return res.json({
        success: true,
        request: null,
        message: "No request found between these users",
      });
    }

    // Obtener mensajes - prueba ambos nombres
    let messages: any[] = [];
    try {
      messages = await (prisma as any).message.findMany({
        where: { requestId: request.id },
        orderBy: { createdAt: "asc" },
        take: 50,
      });
    } catch (e1) {
      try {
        messages = await (prisma as any).Message.findMany({
          where: { requestId: request.id },
          orderBy: { createdAt: "asc" },
          take: 50,
        });
      } catch (e2) {
        console.error("Could not find messages:", e2);
        messages = [];
      }
    }

    // Enriquecer con información de usuarios
    const enrichedRequest = {
      ...request,
      messages: messages.map((m: any) => ({
        ...m,
        sender: getUserInfo(m.senderId),
      })),
      fromUser: getUserInfo(request.fromUserId),
      toUser: getUserInfo(request.toUserId),
    };

    return res.json({
      success: true,
      request: enrichedRequest,
      users: {
        current: getUserInfo(userId),
        other: getUserInfo(otherUserId),
      },
    });
  } catch (error) {
    console.error("getRequestByChat error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        error instanceof Error ? error.message : "Failed to get chat request",
    });
  }
}
