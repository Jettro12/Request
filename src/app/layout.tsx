import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
