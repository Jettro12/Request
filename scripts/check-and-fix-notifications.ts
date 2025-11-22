// scripts/check-and-fix-notifications.ts
async function checkAndFixNotifications() {
  try {
    console.log("🔧 Verificando y corrigiendo notificaciones...\n");

    // 1. Verificar notificaciones actuales
    console.log("1. Verificando notificaciones existentes...");
    const response = await fetch(
      "http://localhost:3000/api/notifications?limit=20"
    );

    if (response.ok) {
      const data = await response.json();
      const notifications = data.notifications || [];

      console.log(`   📊 Encontradas: ${notifications.length} notificaciones`);

      if (notifications.length > 0) {
        const unreadNotifications = notifications.filter((n: any) => !n.read);
        console.log(`   🔴 No leídas: ${unreadNotifications.length}`);
        console.log(
          `   ✅ Leídas: ${notifications.length - unreadNotifications.length}`
        );

        // 2. Si todas están leídas, crear nuevas no leídas
        if (unreadNotifications.length === 0) {
          console.log("\n2. 🚨 TODAS las notificaciones están LEÍDAS");
          console.log("   Creando nuevas notificaciones NO LEÍDAS...");

          // Obtener sesión para el usuario actual
          const sessionResponse = await fetch(
            "http://localhost:3000/api/auth/session"
          );
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();

            if (sessionData.user) {
              const newNotifications = [
                {
                  type: "NEW_MESSAGE",
                  title: "Mensaje NUEVO - NO LEÍDO",
                  message:
                    "Este mensaje debería aparecer como NO LEÍDO en el header",
                },
                {
                  type: "REQUEST_RECEIVED",
                  title: "Solicitud NUEVA - NO LEÍDA",
                  message: "Nueva solicitud pendiente de revisión",
                },
              ];

              for (const notif of newNotifications) {
                const createResponse = await fetch(
                  "http://localhost:3000/api/notifications",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...notif,
                      targetUsers: [sessionData.user.id],
                      senderId: sessionData.user.id,
                      relatedId: `fix-${Date.now()}`,
                    }),
                  }
                );

                if (createResponse.ok) {
                  console.log(`   ✅ ${notif.title} - CREADA`);
                } else {
                  console.log(`   ❌ Error creando: ${notif.title}`);
                }
              }

              console.log("\n🎉 Nuevas notificaciones NO LEÍDAS creadas!");
              console.log(
                "📱 Recarga la página para ver el contador en el header"
              );
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkAndFixNotifications();
