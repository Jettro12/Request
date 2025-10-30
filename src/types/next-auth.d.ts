// src/types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      career: string;
      semester: number;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    career: string;
    semester: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    career: string;
    semester: number;
  }
}
