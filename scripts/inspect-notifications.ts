// scripts/inspect-notifications.ts
async function inspectNotifications() {
  try {
    console.log("🔍 Inspeccionando notificaciones en la base de datos...\n");

    // Obtener todas las notificaciones directamente desde la API
    const response = await fetch(
      "http://localhost:3000/api/notifications?limit=20"
    );

    if (response.ok) {
      const data = await response.json();
      const notifications = data.notifications || [];

      console.log(`📊 Total notificaciones: ${notifications.length}\n`);

      if (notifications.length > 0) {
        // Agrupar por tipo y estado
        const byType: any = {};
        const byReadStatus = { read: 0, unread: 0 };

        notifications.forEach((notif: any) => {
          // Contar por tipo
          if (!byType[notif.type]) {
            byType[notif.type] = { total: 0, read: 0, unread: 0 };
          }
          byType[notif.type].total++;
          if (notif.read) {
            byType[notif.type].read++;
            byReadStatus.read++;
          } else {
            byType[notif.type].unread++;
            byReadStatus.unread++;
          }

          // Mostrar detalles de cada notificación
          console.log(
            `📨 ${notif.read ? "✅ LEÍDA" : "🔴 NO LEÍDA"} - ${notif.type}`
          );
          console.log(`   Título: ${notif.title}`);
          console.log(`   Mensaje: ${notif.message}`);
          console.log(
            `   Creada: ${new Date(notif.createdAt).toLocaleString()}`
          );
          console.log(`   ID: ${notif.id}`);
          console.log("   ---");
        });

        console.log("\n📈 ESTADÍSTICAS:");
        console.log(`   Total leídas: ${byReadStatus.read}`);
        console.log(`   Total no leídas: ${byReadStatus.unread}`);

        console.log("\n📋 POR TIPO:");
        Object.keys(byType).forEach((type) => {
          console.log(
            `   ${type}: ${byType[type].unread} no leídas de ${byType[type].total} total`
          );
        });
      } else {
        console.log("❌ No hay notificaciones en la base de datos");
      }
    } else {
      console.log("❌ Error obteniendo notificaciones");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

inspectNotifications();
