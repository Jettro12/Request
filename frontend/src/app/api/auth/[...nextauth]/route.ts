// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Importa la config que creamos arriba

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
