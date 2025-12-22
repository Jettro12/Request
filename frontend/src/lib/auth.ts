import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  // Estrategia de sesión: JWT
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // 1. CORREGIDO: Quitamos "/api/auth" de la URL.
          // Ahora apunta directo a la raíz donde definiste app.post("/login")
          const res = await fetch("http://127.0.0.1:4004/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json(); // Le llamamos 'data' para no confundirnos

          // Log para depurar si falla
          if (!res.ok) {
            console.error("⛔ Login fallido en backend:", data);
            throw new Error(data.error || "Credenciales inválidas");
          }

          // 2. CORREGIDO: Extraemos el usuario del objeto envolvente.
          // Tu backend devuelve { "user": { ... } }, así que retornamos data.user
          if (data.user) {
            return data.user;
          }

          return null;
        } catch (error) {
          console.error("🔥 Error en authorize:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Nota: Tu backend actual NO está devolviendo un 'token' JWT firmado,
        // solo devuelve el objeto usuario. Por ahora comentamos esto para que no falle.
        // token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
