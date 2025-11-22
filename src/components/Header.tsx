"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

interface SimpleNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Hook de polling con debugging
function useNotificationsPolling() {
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    if (isLoading) {
      console.log("🔄 Skipping - already loading");
      return;
    }

    try {
      setIsLoading(true);
      console.log("🔄 Fetching notifications...");

      // ✅ Aumentar el límite a 10
      const response = await fetch("/api/notifications?limit=10");

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("📨 Data received:", data);

        if (data.notifications && Array.isArray(data.notifications)) {
          console.log(`✅ ${data.notifications.length} notifications loaded`);
          setNotifications(data.notifications);
          const unread = data.notifications.filter(
            (n: SimpleNotification) => !n.read
          ).length;
          setUnreadCount(unread);
          console.log(`📊 Unread count: ${unread}`);
        } else {
          console.log("❌ No notifications array in response");
        }
      } else {
        const errorText = await response.text();
        console.error("❌ Response error:", errorText);
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    setNotifications,
    setUnreadCount,
  };
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Usar el hook de polling
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    setNotifications,
    setUnreadCount,
  } = useNotificationsPolling();

  const isLoggedIn = status === "authenticated";

  // ✅ Polling cada 10 segundos (menos agresivo)
  useEffect(() => {
    if (isLoggedIn) {
      console.log("👤 User logged in, starting notifications polling...");
      fetchNotifications(); // Cargar inmediatamente

      const interval = setInterval(() => {
        fetchNotifications();
      }, 10000); // 10 segundos

      return () => {
        console.log("🧹 Cleaning up notifications polling");
        clearInterval(interval);
      };
    } else {
      console.log("👤 User not logged in, clearing notifications");
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  const markAsRead = async (notificationId: string) => {
    try {
      console.log("📝 Marking notification as read:", notificationId);
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
      });

      // Actualizar estado local inmediatamente
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      console.log("✅ Notification marked as read");
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log("📝 Marking all notifications as read");
      await fetch("/api/notifications", {
        method: "PATCH",
      });

      // Actualizar estado local
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      setShowNotifications(false);
      console.log("✅ All notifications marked as read");
    } catch (error) {
      console.error("❌ Error marking all as read:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  if (status === "loading") {
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
                {/* Enlace a Solicitudes */}
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

                {/* Componente de Notificaciones con Polling */}
                <div className="relative">
                  <button
                    onClick={() => {
                      console.log("🔔 Toggling notifications dropdown");
                      setShowNotifications(!showNotifications);
                      if (!showNotifications) {
                        fetchNotifications(); // Recargar al abrir
                      }
                    }}
                    className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-3.79 1.44 5.97 5.97 0 01-3.79-1.44M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </>
                    )}
                  </button>

                  {/* Dropdown de Notificaciones */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                      <div className="p-4 border-b">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold">
                            Notificaciones ({notifications.length})
                          </h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={fetchNotifications}
                              className="text-sm text-gray-600 hover:text-blue-600 p-1"
                              disabled={isLoading}
                              title="Actualizar"
                            >
                              {isLoading ? "⏳" : "🔄"}
                            </button>
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Marcar todas
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No hay notificaciones
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                                !notification.read ? "bg-blue-50" : ""
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">
                                    {notification.title}
                                  </p>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleDateString("es-ES", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2 border-t">
                        <div className="text-center text-xs text-gray-500">
                          {notifications.length} notificaciones • Se actualiza
                          cada 10s
                        </div>
                      </div>
                    </div>
                  )}
                </div>

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
