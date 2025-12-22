"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isLoggedIn = status === "authenticated";
  const isLoading = status === "loading";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Request</h1>
            </div>
            <div className="text-gray-600">Cargando...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link
              href={isLoggedIn ? "/dashboard" : "/"}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Request</h1>
            </Link>

            {/* Navegación */}
            {isLoggedIn && (
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/dashboard"
                  className={`${
                    pathname === "/dashboard"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`${
                    pathname === "/profile"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Mi Perfil
                </Link>
              </nav>
            )}
          </div>
          <Link
            href="/requests"
            className={`${
              pathname === "/requests"
                ? "text-blue-600 font-medium"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            📨 Solicitudes
          </Link>
          {/* Barra de Búsqueda */}
          {isLoggedIn && (
            <div className="flex-1 max-w-2xl mx-8 relative">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar personas, proyectos, oportunidades..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearchResults(true)}
                    className="w-full px-4 py-2 pl-10 pr-4 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">🔍</span>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Navegación de usuario */}
          <nav className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                  <span>Hola,</span>
                  <span className="font-medium">{session?.user?.name}</span>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`${
                    pathname === "/login"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
