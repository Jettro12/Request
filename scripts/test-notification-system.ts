// scripts/test-notification-system.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testNotificationSystem() {
  try {
    console.log("🧪 Probando sistema de notificaciones...");

    // 1. Verificar si hay usuarios
    const users = await prisma.user.findMany({ take: 2 });
    console.log(`👥 Usuarios encontrados: ${users.length}`);

    if (users.length < 2) {
      console.log("❌ Necesitas al menos 2 usuarios para probar");
      return;
    }

    const [user1, user2] = users;

    // 2. Crear una notificación de prueba
    console.log("📨 Creando notificación de prueba...");
    const notification = await prisma.notification.create({
      data: {
        type: "NEW_MESSAGE",
        title: "Mensaje de prueba",
        message: `${user1.name} te envió un mensaje`,
        userId: user2.id, // user2 recibe la notificación
        senderId: user1.id, // user1 envía la notificación
        relatedId: "test-message-123",
      },
      include: {
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("✅ Notificación creada:");
    console.log({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      from: notification.sender?.name,
      to: notification.user.name,
      read: notification.read,
    });

    // 3. Verificar que se puede obtener via API
    console.log("🔍 Verificando API...");
    const response = await fetch(
      `http://localhost:3000/api/notifications?userId=${user2.id}`
    );
    const data = await response.json();
    console.log(
      `📊 Notificaciones via API: ${data.notifications?.length || 0}`
    );

    // 4. Limpiar
    await prisma.notification.delete({
      where: { id: notification.id },
    });
    console.log("🧹 Notificación de prueba eliminada");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationSystem();
