// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. Importamos el componente que creamos en el paso 2.1
// Si el archivo lo llamaste Providers.tsx, usa este import:
import { Providers } from "../components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Request - Tu Red Universitaria",
  description: "Conecta con estudiantes, proyectos y oportunidades",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* 2. Envolvemos toda la aplicación con el Provider */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
