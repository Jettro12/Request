import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// Ya no necesitamos getApiUrl aquí porque usaremos rutas internas directas
// import { getApiUrl } from "@/config/api";

/**
 * ⚠️ IMPORTANTE
 * NO lanzar error en build time.
 * Next.js evalúa este archivo durante `next build`.
 */
const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET || "dev-secret-only-for-build";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.warn("⚠️ Credenciales incompletas");
          return null;
        }

        try {
          /**
           * 🔐 LOGIN → auth-service
           * CORRECCIÓN: Usamos la URL INTERNA de Docker directamente.
           * Esto evita que el servidor se pierda intentando salir a internet.
           */
          const loginUrl = "http://auth-service:4004/login";
          console.log("🔐 Login auth-service (Internal):", loginUrl);

          const response = await fetch(loginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            console.error("❌ Login fallido status:", response.status);
            return null;
          }

          const data = await response.json();
          // A veces la respuesta viene anidada en data.user o directa
          const userBasic = data.user || data.data?.user || data;

          if (!userBasic?.id || !userBasic?.email) {
            console.error("❌ Respuesta inválida auth-service:", data);
            return null;
          }

          /**
           * 👤 Obtener datos completos → users-service
           * CORRECCIÓN: Usamos la URL INTERNA de Docker también aquí.
           */
          try {
            // Nota: users-service corre en el puerto 4007
            const usersUrl = `http://users-service:4007/profile/${userBasic.id}`;
            // Ojo: Si tu ruta es /users/:id, usa esta:
            // const usersUrl = `http://users-service:4007/${userBasic.id}`;

            console.log("👤 Fetch users-service (Internal):", usersUrl);

            const userRes = await fetch(usersUrl);

            if (userRes.ok) {
              const userData = await userRes.json();
              // Ajuste por si viene envuelto en { success: true, data: { user: ... } }
              const userDetails =
                userData.data?.user || userData.user || userData;

              return {
                id: userDetails.id || userBasic.id,
                email: userDetails.email || userBasic.email,
                name: userDetails.name || userBasic.name,
                career: userDetails.career,
                semester: userDetails.semester,
                avatar: userDetails.avatar,
                bio: userDetails.bio,
                skills: userDetails.skills ?? [],
                interests: userDetails.interests ?? [],
                rating: userDetails.rating ?? 0,
                reviewCount: userDetails.reviewCount ?? 0,
              };
            }
          } catch (err) {
            console.warn(
              "⚠️ Users-service no disponible o error de red, usando datos básicos"
            );
          }

          /**
           * 🧩 Fallback mínimo (Si falla el servicio de usuarios)
           */
          return {
            id: userBasic.id,
            email: userBasic.email,
            name: userBasic.name ?? userBasic.email.split("@")[0],
            career: "No especificado",
            semester: 1,
            skills: [],
            interests: [],
            rating: 0,
            reviewCount: 0,
          };
        } catch (error: any) {
          console.error("🔥 Error CRÍTICO en authorize:", error.message);
          return null;
        }
      },
    }),
  ],

  /**
   * 🧠 JWT (correcto detrás de NGINX/ALB)
   */
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/auth/error",
    newUser: "/register",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.career = user.career;
        token.semester = user.semester;
        token.avatar = user.avatar;
        token.bio = user.bio;
        token.skills = user.skills;
        token.interests = user.interests;
        token.rating = user.rating;
        token.reviewCount = user.reviewCount;
      }
      return token;
    },

    async session({ session, token }) {
      if (!session.user) {
        session.user = {} as any;
      }
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.user.career = token.career as string;
      session.user.semester = token.semester as number;
      session.user.avatar = token.avatar as string;
      session.user.bio = token.bio as string;
      session.user.skills = token.skills as string[];
      session.user.interests = token.interests as string[];
      session.user.rating = token.rating as number;
      session.user.reviewCount = token.reviewCount as number;

      return session;
    },
  },

  secret: NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
