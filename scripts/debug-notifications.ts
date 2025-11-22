// scripts/debug-notifications.ts
async function debugNotifications() {
  try {
    console.log("🔍 DEBUG: Estado actual de notificaciones\n");

    // Obtener usuarios
    const usersResponse = await fetch("http://localhost:3000/api/users");
    const usersData = await usersResponse.json();

    if (!usersData.users || usersData.users.length === 0) {
      console.log("❌ No hay usuarios en la base de datos");
      return;
    }

    console.log(`👥 Usuarios encontrados: ${usersData.users.length}`);

    // Verificar notificaciones para cada usuario
    for (const user of usersData.users) {
      console.log(`\n--- Notificaciones para ${user.name} (${user.email}) ---`);

      const notificationsResponse = await fetch(
        `http://localhost:3000/api/notifications?limit=20`
      );

      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        const userNotifications = notificationsData.notifications || [];

        console.log(`   Total: ${userNotifications.length}`);

        if (userNotifications.length > 0) {
          userNotifications.forEach((notif: any, index: number) => {
            console.log(
              `   ${index + 1}. [${notif.read ? "LEÍDA" : "NO LEÍDA"}] ${
                notif.type
              }: ${notif.title}`
            );
            console.log(`      Mensaje: ${notif.message}`);
            console.log(
              `      Creada: ${new Date(notif.createdAt).toLocaleString()}`
            );
          });
        } else {
          console.log("   ❌ No tiene notificaciones");
        }
      } else {
        console.log("   ❌ Error obteniendo notificaciones");
      }
    }
  } catch (error) {
    console.error("❌ Error en debug:", error);
  }
}

debugNotifications();
