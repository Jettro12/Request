/**
 * Tipo completo de Usuario para usar en toda la aplicación
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  
  // Información académica
  career: string;
  semester: number;
  university?: string;
  studentId?: string;
  
  // Perfil
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  
  // Habilidades e intereses
  skills: string[];
  interests: string[];
  
  // Rating y reputación
  rating: number;
  reviewCount: number;
  completedRequests: number;
  
  // Estado
  isVerified: boolean;
  isActive: boolean;
  role: "user" | "admin" | "moderator";
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

/**
 * Tipo para creación/actualización de usuario
 */
export interface UserCreateInput {
  email: string;
  password: string;
  name: string;
  career?: string;
  semester?: number;
  avatar?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  phone?: string;
  university?: string;
}

/**
 * Tipo para actualización parcial de usuario
 */
export interface UserUpdateInput {
  name?: string;
  career?: string;
  semester?: number;
  avatar?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  phone?: string;
  university?: string;
}

/**
 * Respuesta de login
 */
export interface AuthResponse {
  user: UserProfile;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Respuesta de verificación de sesión
 */
export interface SessionValidation {
  isValid: boolean;
  user?: UserProfile;
  error?: string;
}