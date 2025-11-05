"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import RequestModal from "@/components/RequestModal";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  career: string;
  semester: number;
  rating: number;
  reviewCount: number;
  bio?: string;
  skills: string[];
  interests: string[];
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/${userId}`);

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Usuario no encontrado");
        }
      } catch (err) {
        setError("Error al cargar el perfil");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  // Función para renderizar estrellas
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xl ${
              star <= Math.round(rating || 0)
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

  if (isLoading) {
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

  if (error || !user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Usuario no encontrado
            </h1>
            <p className="text-gray-600 mt-2">
              {error || "El perfil que buscas no existe."}
            </p>
          </div>
        </div>
      </>
    );
  }

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
                  {user.name.charAt(0)}
                </span>
              </div>

              {/* Información Principal */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user.name}
                    </h1>
                    <p className="text-gray-600 text-lg">
                      {user.career} • {user.semester}° Semestre
                    </p>
                    {user.bio && (
                      <p className="text-gray-700 mt-3 max-w-2xl">{user.bio}</p>
                    )}
                  </div>

                  {/* Rating Mejorado */}
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-3">
                      {renderStars(user.rating || 0)}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {user.rating ? user.rating.toFixed(1) : "Nuevo"}
                        </div>
                        {user.reviewCount > 0 && (
                          <div className="text-sm text-gray-600">
                            {user.reviewCount}{" "}
                            {user.reviewCount === 1 ? "reseña" : "reseñas"}
                          </div>
                        )}
                      </div>
                    </div>
                    {!user.rating && (
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
                    {new Date(user.createdAt).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Columna Izquierda - Habilidades */}
            <div className="md:col-span-2 space-y-6">
              {/* Habilidades */}
              {user.skills && user.skills.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Habilidades
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
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
              {user.interests && user.interests.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Intereses
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, index) => (
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

            {/* Columna Derecha - Información */}
            <div className="space-y-6">
              {/* Información del Usuario */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Información
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Carrera</p>
                    <p className="font-medium text-gray-900">{user.career}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Semestre</p>
                    <p className="font-medium text-gray-900">
                      {user.semester}° Semestre
                    </p>
                  </div>

                  {/* Rating Detallado */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Calificación</p>
                    <div className="flex items-center space-x-3">
                      {renderStars(user.rating || 0)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.rating
                            ? user.rating.toFixed(1) + " / 5.0"
                            : "Sin calificaciones"}
                        </p>
                        {user.reviewCount > 0 && (
                          <p className="text-sm text-gray-600">
                            Basado en {user.reviewCount}{" "}
                            {user.reviewCount === 1
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
              {user.rating && user.reviewCount > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Estadísticas
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {user.reviewCount}
                      </div>
                      <div className="text-sm text-gray-600">
                        Colaboraciones
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {user.rating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Rating Promedio
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm flex-1"
                  >
                    📨 Enviar Request
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal para enviar Request */}
          {showRequestModal && user && (
            <RequestModal
              receiverId={user.id}
              receiverName={user.name}
              onClose={() => setShowRequestModal(false)}
              onSuccess={() => {
                setShowRequestModal(false);
                // Opcional: mostrar mensaje de éxito
              }}
            />
          )}
        </div>
      </main>
    </>
  );
}
