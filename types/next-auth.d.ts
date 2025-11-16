// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    career: string;
    semester: number;
    avatar?: string;
    bio?: string;
    skills: string[];
    interests: string[];
    rating: number;
    reviewCount: number;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    career: string;
    semester: number;
  }
}
