// src/app/test-db/page.tsx
import { prisma } from "@/lib/db";

export default async function TestDB() {
  try {
    // Intentar conectar a la base de datos
    await prisma.$connect();
    const userCount = await prisma.user.count();

    return (
      <div className="p-8">
        <h1>✅ Base de datos conectada correctamente</h1>
        <p>Usuarios en la base de datos: {userCount}</p>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h1>❌ Error conectando a la base de datos</h1>
        <pre>
          {error instanceof Error ? error.message : "Error desconocido"}
        </pre>
      </div>
    );
  }
}
