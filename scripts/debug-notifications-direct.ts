// scripts/debug-notifications-direct.ts
async function debugNotificationsDirect() {
  try {
    console.log("🔍 Debug directo de notificaciones...\n");

    // Probar la API de notificaciones directamente
    console.log("1. Probando GET /api/notifications...");
    const response = await fetch(
      "http://localhost:3000/api/notifications?limit=10"
    );

    console.log("   Status:", response.status);
    console.log("   OK:", response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log("   ✅ Datos recibidos correctamente");
      console.log("   Notifications array:", Array.isArray(data.notifications));
      console.log(
        "   Number of notifications:",
        data.notifications?.length || 0
      );

      if (data.notifications && data.notifications.length > 0) {
        console.log("\n2. 📋 Detalles de las notificaciones:");
        data.notifications.forEach((notif: any, index: number) => {
          console.log(
            `   ${index + 1}. ${notif.read ? "✅ LEÍDA" : "🔴 NO LEÍDA"} - ${
              notif.type
            }`
          );
          console.log(`      Título: ${notif.title}`);
          console.log(`      Mensaje: ${notif.message}`);
          console.log(`      ID: ${notif.id}`);
          console.log(`      UserId: ${notif.userId}`);
          console.log(
            `      Creada: ${new Date(notif.createdAt).toLocaleString()}`
          );
        });

        // Estadísticas
        const unreadCount = data.notifications.filter(
          (n: any) => !n.read
        ).length;
        console.log(`\n3. 📊 Resumen:`);
        console.log(`   Total: ${data.notifications.length}`);
        console.log(`   No leídas: ${unreadCount}`);
        console.log(`   Leídas: ${data.notifications.length - unreadCount}`);
      } else {
        console.log("   ❌ No hay notificaciones en el array");
      }
    } else {
      const errorText = await response.text();
      console.log("   ❌ Error:", errorText);
    }
  } catch (error) {
    console.error("❌ Error en debug:", error);
  }
}

debugNotificationsDirect();
