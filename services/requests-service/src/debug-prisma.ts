import { prisma } from "./prisma";

async function debugPrisma() {
  console.log("=== PRISMA DEBUG ===");
  console.log("All keys:", Object.keys(prisma));

  const models = Object.keys(prisma).filter(
    (key) =>
      !key.startsWith("$") &&
      !key.startsWith("_") &&
      typeof (prisma as any)[key] === "object",
  );

  console.log("\nAvailable models:", models);

  // Verifica cada modelo
  for (const model of models) {
    console.log(`\nModel: ${model}`);
    console.log("Methods:", Object.keys((prisma as any)[model]));
  }

  await prisma.$disconnect();
}

debugPrisma().catch(console.error);
