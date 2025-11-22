// scripts/clean-database-sql.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Definir interfaz para los posts huérfanos
interface OrphanedPost {
  id: string;
  title: string;
  authorId: string;
}

async function cleanDatabaseSQL() {
  try {
    console.log("🧹 Limpiando base de datos con SQL directo...");

    // 1. Deshabilitar temporalmente las constraints (si es posible)
    try {
      await prisma.$executeRaw`ALTER TABLE posts DROP CONSTRAINT IF EXISTS "posts_authorId_fkey"`;
      console.log("✅ Constraints deshabilitadas temporalmente");
    } catch (e) {
      console.log("ℹ️ No se pudieron deshabilitar constraints, continuando...");
    }

    // 2. Limpiar posts huérfanos
    const orphanedPosts = await prisma.$queryRaw<OrphanedPost[]>`
      SELECT id, title, "authorId" 
      FROM posts 
      WHERE "authorId" NOT IN (SELECT id FROM users)
    `;
    console.log(`📝 Encontrados ${orphanedPosts.length} posts huérfanos`);

    if (orphanedPosts.length > 0) {
      await prisma.$executeRaw`
        DELETE FROM posts 
        WHERE "authorId" NOT IN (SELECT id FROM users)
      `;
      console.log("✅ Posts huérfanos eliminados");
    }

    // 3. Limpiar otras tablas
    const tables = [
      { name: "messages", columns: ['"senderId"', '"receiverId"'] },
      { name: "requests", columns: ['"fromUserId"', '"toUserId"'] },
      { name: "reviews", columns: ['"fromUserId"', '"toUserId"'] },
      { name: "notifications", columns: ['"userId"', '"senderId"'] },
    ];

    for (const table of tables) {
      let conditions = table.columns
        .map(
          (col) => `${col} IS NOT NULL AND ${col} NOT IN (SELECT id FROM users)`
        )
        .join(" OR ");

      const result: any = await prisma.$executeRawUnsafe(
        `DELETE FROM ${table.name} WHERE ${conditions}`
      );
      console.log(`✅ ${table.name}: ${result} registros huérfanos eliminados`);
    }

    console.log("🎉 Limpieza completada!");
  } catch (error) {
    console.error("❌ Error durante la limpieza:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabaseSQL();
