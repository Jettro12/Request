// scripts/fix-orphaned-posts.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixOrphanedPosts() {
  try {
    console.log("🔍 Buscando posts huérfanos...");

    // Encontrar todos los posts
    const allPosts = await prisma.post.findMany({
      include: {
        author: true,
      },
    });

    // Identificar posts huérfanos (donde author es null)
    const orphanedPosts = allPosts.filter((post) => post.author === null);

    console.log(`📝 Encontrados ${orphanedPosts.length} posts huérfanos`);

    // Eliminar posts huérfanos
    if (orphanedPosts.length > 0) {
      for (const post of orphanedPosts) {
        console.log(`🗑️ Eliminando post: ${post.title} (ID: ${post.id})`);
        await prisma.post.delete({
          where: { id: post.id },
        });
      }
      console.log("✅ Todos los posts huérfanos eliminados");
    } else {
      console.log("✅ No se encontraron posts huérfanos");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrphanedPosts();
