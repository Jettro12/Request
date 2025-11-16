import { prisma } from "@/lib/db";
import { NotificationType } from ".prisma/client/default";

interface CreateNotificationParams {
  type: NotificationType;
  userId: string;
  title: string;
  message: string;
  relatedId?: string;
}

export async function createNotification({
  type,
  userId,
  title,
  message,
  relatedId,
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type,
        userId,
        title,
        message,
        relatedId,
      },
    });

    console.log(`🔔 Notificación creada: ${type} para usuario ${userId}`);
    return notification;
  } catch (error) {
    console.error("❌ Error creando notificación:", error);
    throw error;
  }
}

export async function getUserNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50, // Últimas 50 notificaciones
    });

    return notifications;
  } catch (error) {
    console.error("❌ Error obteniendo notificaciones:", error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return notification;
  } catch (error) {
    console.error("❌ Error marcando notificación como leída:", error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });

    return { success: true };
  } catch (error) {
    console.error(
      "❌ Error marcando todas las notificaciones como leídas:",
      error
    );
    throw error;
  }
}

export async function getUnreadCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return count;
  } catch (error) {
    console.error("❌ Error obteniendo conteo de no leídas:", error);
    throw error;
  }
}
