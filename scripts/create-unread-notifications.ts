// scripts/create-unread-notifications.ts
async function createUnreadNotifications() {
  try {
    console.log("📨 Creando notificaciones NO LEÍDAS...\n");

    // Obtener usuarios
    const usersResponse = await fetch("http://localhost:3000/api/users");
    const usersData = await usersResponse.json();

    if (!usersData.users || usersData.users.length < 2) {
      console.log("❌ Necesitas al menos 2 usuarios");
      return;
    }

    const [user1, user2] = usersData.users;

    console.log(`👥 Usando: ${user1.name} → ${user2.name}\n`);

    const notificationTypes = [
      {
        type: "NEW_MESSAGE",
        title: "Mensaje URGENTE - NO LEÍDO",
        message: `${user1.name} te envió un mensaje urgente`,
      },
      {
        type: "REQUEST_RECEIVED",
        title: "Solicitud IMPORTANTE - NO LEÍDA",
        message: `${user1.name} te envió una solicitud importante`,
      },
      {
        type: "NEW_POST",
        title: "Publicación NUEVA - NO LEÍDA",
        message: `${user1.name} publicó contenido nuevo en tu carrera`,
      },
    ];

    let createdCount = 0;

    for (const notifType of notificationTypes) {
      try {
        console.log(`📝 Creando: ${notifType.title}...`);

        const response = await fetch(
          "http://localhost:3000/api/notifications",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...notifType,
              targetUsers: [user2.id],
              senderId: user1.id,
              relatedId: `unread-test-${Date.now()}`,
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log(`   ✅ ${notifType.title} - CREADA`);
          console.log(`      ID: ${result.notifications[0].id}`);
          console.log(`      ¿Leída?: ${result.notifications[0].read}`);
          createdCount++;
        } else {
          const errorText = await response.text();
          console.log(`   ❌ ERROR:`, errorText.substring(0, 100));
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`   ❌ EXCEPCIÓN:`, error.message);
      }
    }

    console.log(`\n🎉 ${createdCount} notificaciones creadas`);
    console.log(
      "\n📱 Ahora verifica en la aplicación si aparecen como NO LEÍDAS"
    );
  } catch (error) {
    console.error("❌ Error general:", error);
  }
}

createUnreadNotifications();
