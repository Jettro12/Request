"use client";

import Header from "@/components/Header";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { ApiClient, User } from "@/lib/api/client";
import Link from "next/link";

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
        setError("");
        const result = await ApiClient.users.getUserProfile(session.user.id);

        if (result.success && result.data?.user) {
          setUser(result.data.user);
        } else {
          setError(result.error || "Error al cargar el perfil");
        }
      } catch (err) {
        setError("Error de conexión");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") loadUserProfile();
  }, [session, status]);

  // Manejo de estados de carga y acceso
  if (status === "loading" || isLoading) return <LoadingScreen />;
  if (status !== "authenticated") return <AccessRestricted />;
  if (error && !user) return <ErrorDisplay error={error} />;

  // Valores seguros para evitar errores de renderizado
  const safeName = user?.name || session?.user?.name || "Usuario";
  const safeCareer = user?.career || "Ingeniería en Sistemas";
  const safeSemester = user?.semester || "?";
  const safeRating = user?.rating || 0;
  const safeReviewCount = user?.reviewCount || 0;
  const safeSkills = user?.skills || [];
  const safeInterests = user?.interests || [];
  const safeBio = user?.bio || "";
  const safeCreatedAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-ES")
    : "Reciente";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8 font-sans">
        <div className="max-w-5xl mx-auto px-4">
          {/* SECCIÓN SUPERIOR: HEADER DE PERFIL */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 text-center md:text-left">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {safeName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
                      {safeName}
                    </h1>
                    <p className="text-blue-600 font-semibold text-lg">
                      {safeCareer} • {safeSemester}° Semestre
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-black text-gray-900">
                        {safeRating > 0 ? safeRating.toFixed(1) : "—"}
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">
                        Rating
                      </div>
                    </div>
                    <div className="h-8 w-px bg-gray-200"></div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-gray-900">
                        {safeReviewCount}
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">
                        Reseñas
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-gray-600 leading-relaxed italic max-w-2xl">
                    {safeBio
                      ? `"${safeBio}"`
                      : "Aún no has agregado una descripción a tu perfil."}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-400">
                  <span>📅 Miembro desde {safeCreatedAt}</span>
                  <span className="mx-2">•</span>
                  <span>✉️ {session?.user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* COLUMNA IZQUIERDA: DETALLES */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🚀</span> Habilidades
                </h2>
                <div className="flex flex-wrap gap-2">
                  {safeSkills.length > 0 ? (
                    safeSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-100"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No has seleccionado habilidades.
                    </p>
                  )}
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">💡</span> Intereses
                </h2>
                <div className="flex flex-wrap gap-2">
                  {safeInterests.length > 0 ? (
                    safeInterests.map((interest, i) => (
                      <span
                        key={i}
                        className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium border border-purple-100"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No has seleccionado intereses.
                    </p>
                  )}
                </div>
              </section>
            </div>

            {/* COLUMNA DERECHA: ACCIONES */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Gestión de Perfil
                </h2>
                <div className="space-y-3">
                  <Link
                    href="/profile/edit"
                    className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-100"
                  >
                    <span>✏️ Editar Información</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center justify-center w-full border-2 border-red-100 text-red-600 hover:bg-red-50 font-bold py-3 rounded-xl transition-all"
                  >
                    <span>🚪 Cerrar Sesión</span>
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

// COMPONENTES DE APOYO (ESTADOS)
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-500 font-medium">
        Sincronizando con Request-App...
      </p>
    </div>
  );
}

function AccessRestricted() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Acceso Restringido
        </h1>
        <p className="text-gray-600 mb-6">
          Debes estar autenticado para ver esta sección.
        </p>
        <Link
          href="/login"
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold"
        >
          Ir al Login
        </Link>
      </div>
    </div>
  );
}

function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 text-center max-w-md">
        <p className="text-lg font-bold mb-2">¡Ups! Algo salió mal</p>
        <p className="mb-4 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
