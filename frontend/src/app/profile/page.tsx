"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import RequestModal from "@/components/RequestModal";
// Importamos User de aquí para no redefinirlo
import { ApiClient, User } from "../../lib/api/client";

export default function Profile() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await ApiClient.users.getUserProfile(session.user.id);

        // CORRECCIÓN 1: Acceder a result.data.user
        if (result.success && result.data) {
          setUserData(result.data.user);
        } else {
          setError(result.error || "Error al cargar el perfil");
        }
      } catch (err) {
        setError("Error de conexión");
        console.error("Error cargando perfil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [session]);

  const handleSendRequest = () => {
    if (!session) {
      alert("Debes iniciar sesión para enviar una solicitud");
      return;
    }
    if (userData && session.user?.id === userData.id) {
      alert("No puedes enviarte una solicitud a ti mismo");
      return;
    }
    setShowRequestModal(true);
  };

  // CORRECCIÓN 2: Definir la función renderStars que faltaba
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${
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
            <p className="text-gray-600 mt-4">Cargando tu perfil...</p>
          </div>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              No has iniciado sesión
            </h1>
            <p className="text-gray-600 mt-2">
              Por favor inicia sesión para ver tu perfil
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
        </div>
      </>
    );
  }

  const user = userData || {
    id: session?.user?.id || "",
    name: session?.user?.name || "Usuario",
    email: session?.user?.email || "",
    career: session?.user?.career || "No especificado",
    semester: session?.user?.semester || 1,
    bio: "Completa tu biografía para que otros usuarios te conozcan mejor.",
    skills: [],
    interests: [],
    rating: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header del Perfil */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {user.name.charAt(0)}
                </span>
              </div>

              {/* Información Principal */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user.name}
                    </h1>
                    <p className="text-gray-600 text-lg mt-1">
                      {user.career} • {user.semester}° Semestre
                    </p>
                    {user.bio && (
                      <p className="text-gray-700 mt-3 max-w-2xl">{user.bio}</p>
                    )}
                  </div>

                  {/* Rating Mejorado */}
                  <div className="flex flex-col items-start md:items-end space-y-2">
                    <div className="flex items-center space-x-3">
                      {/* Aquí usamos la función que acabamos de crear */}
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
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-wrap gap-3 ml-auto">
                {session?.user?.id === userData?.id ? (
                  <>
                    <Link
                      href="/profile/edit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Editar Perfil
                    </Link>
                    <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium">
                      Compartir Perfil
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSendRequest}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      📨 Enviar Request
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium">
                      Seguir
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Columna Izquierda - Información Personal */}
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

            {/* Columna Derecha - Stats y Acciones */}
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

              {/* Botón de Request */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {session?.user?.id === userData?.id
                    ? "¿Buscas colaborar?"
                    : `¿Interesado en colaborar con ${user.name}?`}
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  {session?.user?.id === userData?.id
                    ? "Comparte tu perfil para recibir solicitudes de colaboración de otros estudiantes."
                    : `Envía una solicitud a ${user.name} para proponerle un proyecto o colaboración.`}
                </p>
                {session?.user?.id !== userData?.id && (
                  <button
                    onClick={handleSendRequest}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    📨 Enviar Request
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Request */}
      {showRequestModal && userData && (
        <RequestModal
          receiverId={userData.id}
          receiverName={user.name}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false);
            alert("¡Solicitud enviada exitosamente!");
          }}
        />
      )}
    </>
  );
}
