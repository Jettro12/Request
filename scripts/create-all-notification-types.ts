// scripts/create-all-notification-types.ts
async function createAllNotificationTypes() {
  try {
    console.log("📨 Creando notificaciones de todos los tipos...\n");

    // Obtener usuarios
    const usersResponse = await fetch("http://localhost:3000/api/users");
    const usersData = await usersResponse.json();

    if (!usersData.users || usersData.users.length < 2) {
      console.log("❌ Necesitas al menos 2 usuarios");
      return;
    }

    const [user1, user2] = usersData.users;

    console.log(`👥 Usando: ${user1.name} → ${user2.name}\n`);

    // Tipos de notificación según tu enum
    const notificationTypes = [
      {
        type: "NEW_MESSAGE",
        title: "Nuevo mensaje",
        message: `${user1.name} te envió un mensaje importante`,
      },
      {
        type: "REQUEST_RECEIVED",
        title: "Solicitud recibida",
        message: `${user1.name} te envió una solicitud de colaboración`,
      },
      {
        type: "REQUEST_ACCEPTED",
        title: "Solicitud aceptada",
        message: `${user1.name} aceptó tu solicitud`,
      },
      {
        type: "REQUEST_REJECTED",
        title: "Solicitud rechazada",
        message: `${user1.name} rechazó tu solicitud`,
      },
      {
        type: "AGREEMENT_PROPOSAL",
        title: "Propuesta de acuerdo",
        message: `${user1.name} te envió una propuesta de acuerdo`,
      },
      {
        type: "NEW_POST",
        title: "Nueva publicación",
        message: `${user1.name} publicó en tu carrera`,
      },
      {
        type: "RATING_RECEIVED",
        title: "Nueva calificación",
        message: `${user1.name} te calificó con 5 estrellas`,
      },
    ];

    let createdCount = 0;

    for (const notifType of notificationTypes) {
      try {
        console.log(`📝 Creando: ${notifType.type}...`);

        const response = await fetch(
          "http://localhost:3000/api/notifications",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...notifType,
              targetUsers: [user2.id],
              senderId: user1.id,
              relatedId: `test-${Date.now()}`,
            }),
          }
        );

        if (response.ok) {
          console.log(`   ✅ ${notifType.type} - CREADA`);
          createdCount++;
        } else {
          const errorText = await response.text();
          console.log(
            `   ❌ ${notifType.type} - ERROR:`,
            errorText.substring(0, 100)
          );
        }

        // Pequeña pausa entre notificaciones
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`   ❌ ${notifType.type} - EXCEPCIÓN:`, error.message);
      }
    }

    console.log(
      `\n🎉 Resultado: ${createdCount}/${notificationTypes.length} notificaciones creadas`
    );
    console.log("\n📱 Ahora:");
    console.log("   1. Inicia sesión como:", user2.name);
    console.log("   2. Abre la consola del navegador (F12)");
    console.log("   3. Deberías ver logs del Header cargando notificaciones");
    console.log("   4. Haz clic en el ícono de campana");
  } catch (error) {
    console.error("❌ Error general:", error);
  }
}

createAllNotificationTypes();
