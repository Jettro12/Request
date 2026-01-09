import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getApiUrl } from "@/config/api";

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
           */
          const loginUrl = getApiUrl("auth", "/login");
          console.log("🔐 Login auth-service:", loginUrl);

          const response = await fetch(loginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            console.error("❌ Login fallido:", response.status);
            return null;
          }

          const data = await response.json();
          const userBasic = data.user ?? data;

          if (!userBasic?.id || !userBasic?.email) {
            console.error("❌ Respuesta inválida auth-service:", data);
            return null;
          }

          /**
           * 👤 Obtener datos completos → users-service
           */
          try {
            const usersUrl = getApiUrl("users", `/${userBasic.id}`);
            console.log("👤 Fetch users-service:", usersUrl);

            const userRes = await fetch(usersUrl);

            if (userRes.ok) {
              const userDetails = await userRes.json();

              return {
                id: userDetails.id,
                email: userDetails.email,
                name: userDetails.name,
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
          } catch {
            console.warn(
              "⚠️ Users-service no disponible, usando datos básicos"
            );
          }

          /**
           * 🧩 Fallback mínimo
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
          console.error("🔥 Error en authorize:", error.message);
          return null;
        }
      },
    }),
  ],

  /**
   * 🧠 JWT (correcto detrás de NGINX)
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

  /**
   * 🔐 Secret definido SIEMPRE (build + runtime)
   */
  secret: NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};
