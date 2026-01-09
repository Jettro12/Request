// frontend/src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// ⚠️ Logs SOLO en desarrollo (evita crashes en standalone)
if (process.env.NODE_ENV !== "production") {
  console.log("✅ NextAuth API route cargado correctamente");
}

const handler = NextAuth(authOptions);

// App Router requiere exportar métodos HTTP
export { handler as GET, handler as POST };
