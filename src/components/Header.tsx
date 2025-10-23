"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const isLoggedIn = true; // Temporal

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navegar a página de resultados de búsqueda
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  const quickResults = [
    { name: "Ana García", career: "Ingeniería en Sistemas", type: "user" },
    { name: "Proyectos de Machine Learning", type: "project" },
    { name: "Oportunidades en Psicología", type: "opportunity" },
  ];

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
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <span className="text-gray-500 hover:text-gray-700">
                        ✕
                      </span>
                    </button>
                  )}
                </div>

                {/* Resultados rápidos de búsqueda */}
                {showSearchResults && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wide">
                        Búsqueda rápida
                      </div>

                      {/* Resultados sugeridos */}
                      {quickResults
                        .filter((result) =>
                          result.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((result, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              if (result.type === "user") {
                                router.push(
                                  `/profile?user=${encodeURIComponent(
                                    result.name
                                  )}`
                                );
                              } else {
                                router.push(
                                  `/search?q=${encodeURIComponent(
                                    result.name
                                  )}&type=${result.type}`
                                );
                              }
                              setShowSearchResults(false);
                              setSearchQuery("");
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                result.type === "user"
                                  ? "bg-blue-100 text-blue-600"
                                  : result.type === "project"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-purple-100 text-purple-600"
                              }`}
                            >
                              {result.type === "user" && "👤"}
                              {result.type === "project" && "💼"}
                              {result.type === "opportunity" && "🎯"}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {result.name}
                              </div>
                              {result.career && (
                                <div className="text-sm text-gray-500">
                                  {result.career}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}

                      {/* Ver todos los resultados */}
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleSearch}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-600 font-medium flex items-center justify-between"
                        >
                          <span>
                            Ver todos los resultados para "{searchQuery}"
                          </span>
                          <span>↗</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </form>

              {/* Overlay para cerrar resultados al hacer clic fuera */}
              {showSearchResults && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSearchResults(false)}
                />
              )}
            </div>
          )}

          {/* Navegación de usuario */}
          <nav className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {/* Notificaciones (placeholder) */}
                <button className="text-gray-600 hover:text-blue-600 relative">
                  <span className="text-lg">🔔</span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>

                {/* Mensajes (placeholder) */}
                <button className="text-gray-600 hover:text-blue-600 relative">
                  <span className="text-lg">💬</span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
                </button>

                <button className="text-gray-600 hover:text-blue-600">
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
