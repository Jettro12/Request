"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import RequestModal from "@/components/RequestModal";

interface User {
  id: string;
  name: string;
  email: string;
  career: string;
  semester: number;
  bio: string;
  skills: string[];
  interests: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export default function PublicProfileClient({ user }: { user: User }) {
  const { data: session } = useSession();
  const [showRequestModal, setShowRequestModal] = useState(false);

  const isOwnProfile = session?.user?.id === user.id;

  const handleSendRequest = () => {
    if (!session) {
      alert("Debes iniciar sesión para enviar una solicitud");
      return;
    }
    if (isOwnProfile) {
      alert("No puedes enviarte una solicitud a ti mismo");
      return;
    }
    setShowRequestModal(true);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header del Perfil */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar y Info Básica */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-2xl font-bold text-blue-600">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.name}
                  </h1>
                  <p className="text-gray-600">
                    {user.career} - {user.semester}° Semestre
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center space-x-1">
                      {"★"
                        .repeat(5)
                        .split("")
                        .map((star, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.floor(user.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            {star}
                          </span>
                        ))}
                    </div>
                    <span className="text-gray-600">
                      ({user.reviewCount} evaluaciones)
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-wrap gap-3 ml-auto">
                {isOwnProfile ? (
                  // Botones para el propio perfil
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
                  // Botones para perfiles de otros usuarios
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

          <div className="grid md:grid-cols-3 gap-8">
            {/* Columna Izquierda - Información */}
            <div className="md:col-span-2 space-y-6">
              {/* Bio */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Sobre Mí
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {user.bio ||
                    "Este usuario aún no ha completado su biografía."}
                </p>
              </div>

              {/* Habilidades */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Habilidades Técnicas
                </h2>
                <div className="flex flex-wrap gap-3">
                  {user.skills.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Aún no ha agregado habilidades.
                    </p>
                  )}
                </div>
              </div>

              {/* Intereses */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Intereses y Pasiones
                </h2>
                <div className="flex flex-wrap gap-3">
                  {user.interests.length > 0 ? (
                    user.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Aún no ha agregado intereses.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Columna Derecha - Stats y Acciones */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Estadísticas
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Miembro desde</span>
                    <span className="font-semibold">
                      {new Date(user.createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Evaluaciones</span>
                    <span className="font-semibold">{user.reviewCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rating promedio</span>
                    <span className="font-semibold">
                      {user.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Request Button */}
              {!isOwnProfile && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    ¿Interesado en colaborar?
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Envía una solicitud a {user.name} para proponerle un
                    proyecto o colaboración.
                  </p>
                  <button
                    onClick={handleSendRequest}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    📨 Enviar Request
                  </button>
                </div>
              )}

              {/* Contacto */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Contacto
                </h2>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-blue-600 font-medium">
                    {isOwnProfile
                      ? "Tu perfil está visible"
                      : "Disponible para colaboraciones"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Request */}
      {showRequestModal && (
        <RequestModal
          receiverId={user.id} // ← BIEN
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
