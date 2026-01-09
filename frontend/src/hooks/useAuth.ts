// frontend/src/hooks/useAuth.ts
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth(required = false) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  
  useEffect(() => {
    if (required && status === "unauthenticated") {
      router.push("/login");
    }
  }, [required, status, router]);
  
  return {
    session,
    user: session?.user,
    isLoading,
    isAuthenticated,
    signOut: () => signOut({ redirect: true, callbackUrl: "/login" }),
  };
}

// Versión con roles
export function useRole(requiredRoles: string[] = []) {
  const { session, isLoading, isAuthenticated } = useAuth(true);
  
  const hasRole = requiredRoles.length === 0 || 
    (session?.user?.role && requiredRoles.includes(session.user.role));
  
  return {
    ...session,
    isLoading,
    isAuthenticated,
    hasRole,
    isAdmin: session?.user?.role === "admin",
    isModerator: session?.user?.role === "moderator",
  };
}