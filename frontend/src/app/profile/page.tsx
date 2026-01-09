"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ApiClient, User } from "@/lib/api/client";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);
        const result = await ApiClient.users.getUserProfile(session.user.id);

        if (result.success && result.data) {
          setUser(result.data.user);
        } else {
          setError(result.error || "Error al cargar el perfil");
        }
      } catch (err) {
        setError("Error de conexión");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.id) {
      loadUserProfile();
    }
  }, [session, status]);

  // Valores seguros (si user existe)
  const safeRating = user?.rating || 0;
  const safeReviewCount = user?.reviewCount || 0;
  const safeSkills = user?.skills || [];
  const safeInterests = user?.interests || [];
  const safeCareer = user?.career || "Sin carrera especificada";
  const safeSemester = user?.semester || "?";
  const safeBio = user?.bio || "";
  const safeCreatedAt = user?.createdAt ? new Date(user.createdAt) : new Date();
  const safeName = user?.name || "Usuario";

  // Si está cargando
  if (status === "loading" || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando perfil...</p>
          </div>
        </div>
      </>
    );
  }

  // Si no está autenticado
  if (status !== "authenticated") {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Acceso restringido
            </h1>
            <p className="text-gray-600 mt-2">
              Debes iniciar sesión para ver tu perfil
            </p>
          </div>
        </div>
      </>
    );
  }

  // Si hay error o no hay usuario
  if (error || !user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Error al cargar el perfil
            </h1>
            <p className="text-gray-600 mt-2">{error || "Intenta nuevamente"}</p>
          </div>
        </div>
      </>
    );
  }

  // Función para renderizar estrellas
  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xl ${
              star <= Math.round(rating)
                ? "text-yellow-400"
                : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header del Perfil */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {safeName.charAt(0)}
                </span>
              </div>

              {/* Información Principal */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {safeName}
                    </h1>
                    <p className="text-gray-600 text-lg">
                      {safeCareer} • {safeSemester}° Semestre
                    </p>
                    {safeBio && (
                      <p className="text-gray-700 mt-3 max-w-2xl">{safeBio}</p>
                    )}
                  </div>

                  {/* Rating Mejorado - CORREGIDO */}
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-3">
                      {renderStars(safeRating)}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {safeRating > 0 ? safeRating.toFixed(1) : "Nuevo"}
                        </div>
                        {safeReviewCount > 0 && (
                          <div className="text-sm text-gray-600">
                            {safeReviewCount}{" "}
                            {safeReviewCount === 1 ? "reseña" : "reseñas"}
                          </div>
                        )}
                      </div>
                    </div>
                    {safeRating === 0 && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Sin calificaciones aún
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex space-x-6 text-sm text-gray-600">
                  <span>
                    📅 Miembro desde{" "}
                    {safeCreatedAt.toLocaleDateString("es-ES")}
                  </span>
                  {session.user?.email && (
                    <span>✉️ {session.user.email}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Columna Izquierda - Habilidades e Intereses */}
            <div className="md:col-span-2 space-y-6">
              {/* Habilidades */}
              {safeSkills.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Habilidades
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {safeSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Intereses */}
              {safeInterests.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Intereses
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {safeInterests.map((interest, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha - Información y Acciones */}
            <div className="space-y-6">
              {/* Información del Usuario */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Información
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Carrera</p>
                    <p className="font-medium text-gray-900">{safeCareer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Semestre</p>
                    <p className="font-medium text-gray-900">
                      {safeSemester}° Semestre
                    </p>
                  </div>

                  {/* Rating Detallado */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Calificación</p>
                    <div className="flex items-center space-x-3">
                      {renderStars(safeRating)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {safeRating > 0
                            ? safeRating.toFixed(1) + " / 5.0"
                            : "Sin calificaciones"}
                        </p>
                        {safeReviewCount > 0 && (
                          <p className="text-sm text-gray-600">
                            Basado en {safeReviewCount}{" "}
                            {safeReviewCount === 1
                              ? "colaboración"
                              : "colaboraciones"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats de Rating */}
              {safeRating > 0 && safeReviewCount > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Estadísticas
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {safeReviewCount}
                      </div>
                      <div className="text-sm text-gray-600">
                        Colaboraciones
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {safeRating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Rating Promedio
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Acciones
                </h2>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
                    ✏️ Editar Perfil
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 font-medium">
                    ⚙️ Configuración
                  </button>
                  <button className="w-full border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 font-medium">
                    🚪 Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}