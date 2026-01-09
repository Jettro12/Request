import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

// Extiende los tipos por defecto de NextAuth
declare module "next-auth" {
  /**
   * Extiende la interfaz User por defecto
   */
  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string;
    
    // Campos de perfil (opcionales)
    career?: string;
    semester?: number;
    avatar?: string;
    bio?: string;
    skills?: string[];
    interests?: string[];
    rating?: number;
    reviewCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
    
    // Campos adicionales que puedas necesitar
    role?: "user" | "admin" | "moderator";
    isVerified?: boolean;
    phone?: string;
    university?: string;
  }

  /**
   * Extiende la interfaz Session por defecto
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      career?: string;
      semester?: number;
      avatar?: string;
      bio?: string;
      skills?: string[];
      interests?: string[];
      rating?: number;
      reviewCount?: number;
      role?: "user" | "admin" | "moderator";
      isVerified?: boolean;
    } & DefaultSession["user"];
    
    // Puedes agregar campos adicionales a la sesión si es necesario
    expires: string;
    accessToken?: string; // Si usas tokens de acceso
  }
}

declare module "next-auth/jwt" {
  /**
   * Extiende la interfaz JWT por defecto
   */
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    name: string;
    
    // Campos de perfil
    career?: string;
    semester?: number;
    avatar?: string;
    bio?: string;
    skills?: string[];
    interests?: string[];
    rating?: number;
    reviewCount?: number;
    
    // Campos adicionales
    role?: "user" | "admin" | "moderator";
    isVerified?: boolean;
    phone?: string;
    university?: string;
    
    // Token de acceso si tu auth-service lo provee
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
}

// También puedes extender otros tipos si es necesario
declare module "next-auth/adapters" {
  interface AdapterUser {
    id: string;
    email: string;
    emailVerified: Date | null;
    // Agrega aquí campos específicos de tu adapter si usas uno personalizado
  }
}