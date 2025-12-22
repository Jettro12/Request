// src/middleware.ts
export { default } from "next-auth/middleware";

export const config = {
  // Aquí pones las rutas que QUIERES proteger.
  // El login y register NO van aquí.
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/chat/:path*",
    "/requests/:path*",
    "/search/:path*",
  ],
};
