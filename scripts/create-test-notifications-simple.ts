// scripts/create-test-notifications-simple.ts
async function createTestNotificationsSimple() {
  try {
    console.log("📨 Creando notificaciones de prueba...\n");

    // Primero, obtener el usuario actual de la sesión o crear uno de prueba
    console.log("1. Obteniendo sesión actual...");
    const sessionResponse = await fetch(
      "http://localhost:3000/api/auth/session"
    );

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      console.log(
        "   Sesión:",
        sessionData.user ? "✅ Usuario logueado" : "❌ No hay usuario"
      );

      if (sessionData.user) {
        console.log("   Usuario:", sessionData.user);

        // Crear notificaciones para el usuario actual
        const testNotifications = [
          {
            type: "NEW_MESSAGE",
            title: "TEST - Mensaje NO LEÍDO",
            message:
              "Esta es una notificación de prueba que debería aparecer como NO LEÍDA",
            read: false, // ← Forzar a no leída
          },
          {
            type: "REQUEST_RECEIVED",
            title: "TEST - Solicitud NO LEÍDA",
            message: "Solicitud de prueba - debería verse en el header",
            read: false, // ← Forzar a no leída
          },
          {
            type: "NEW_POST",
            title: "TEST - Publicación NO LEÍDA",
            message: "Publicación de prueba para verificar el sistema",
            read: false, // ← Forzar a no leída
          },
        ];

        console.log("\n2. Creando notificaciones de prueba...");

        for (const notif of testNotifications) {
          const response = await fetch(
            "http://localhost:3000/api/notifications",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...notif,
                targetUsers: [sessionData.user.id], // Notificar al usuario actual
                senderId: sessionData.user.id, // El usuario se envía a sí mismo
                relatedId: `test-${Date.now()}`,
              }),
            }
          );

          if (response.ok) {
            const result = await response.json();
            console.log(`   ✅ ${notif.title}`);
            console.log(`      ID: ${result.notifications[0].id}`);
            console.log(`      Read: ${result.notifications[0].read}`);
          } else {
            console.log(`   ❌ Error creando: ${notif.title}`);
          }

          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        console.log("\n🎉 Notificaciones de prueba creadas!");
        console.log("📱 Ahora recarga la página y verifica el header");
      } else {
        console.log("   ❌ No hay usuario logueado. Inicia sesión primero.");
      }
    } else {
      console.log("   ❌ Error obteniendo sesión");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

createTestNotificationsSimple();
