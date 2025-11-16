import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Convertir campos null a undefined para que coincidan con el tipo User
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          career: user.career,
          semester: user.semester,
          avatar: user.avatar || undefined, // ← Convertir null a undefined
          bio: user.bio || undefined, // ← Convertir null a undefined
          skills: user.skills,
          interests: user.interests,
          rating: user.rating,
          reviewCount: user.reviewCount,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.career = (user as any).career;
        token.semester = (user as any).semester;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.career = token.career as string;
        session.user.semester = token.semester as number;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
