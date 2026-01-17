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
      // Usamos la sesión SOLO para obtener el ID del usuario logueado
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);
        setError("");

        // Consultamos directamente al microservicio de usuarios
        const result = await ApiClient.users.getUserProfile(session.user.id);

        // Extracción estricta de la data según la respuesta del microservicio
        const userData =
          result.data?.user ||
          (result as any).user ||
          ((result as any).id ? result : null);

        if (result.success && userData) {
          setUser(userData as User); // Hacemos un cast final a nuestra interfaz User
          setError("");
        } else {
          setError(
            result.error ||
              "No se pudo obtener la información del microservicio.",
          );
        }
      } catch (err) {
        setError("Error de conexión con el microservicio de usuarios.");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      loadUserProfile();
    }
  }, [session, status]);

  // Pantallas de estado (Carga, No autenticado, Error Real)
  if (status === "loading" || isLoading) return <LoadingScreen />;
  if (status === "unauthenticated") return <AccessRestricted />;
  if (error) return <ErrorDisplay error={error} />;
  if (!user)
    return <ErrorDisplay error="El usuario no existe en la base de datos." />;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8 font-sans">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 text-center md:text-left">
            <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {user.name?.charAt(0) || "U"}
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
                    {user.name}
                  </h1>
                  <p className="text-blue-600 font-semibold text-lg">
                    {user.career} • {user.semester}° Semestre
                  </p>
                </div>

                <div className="mt-4 md:mt-0 bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center space-x-4">
                  <div className="text-center px-2">
                    <div className="text-2xl font-black text-gray-900">
                      {user.rating && user.rating > 0
                        ? user.rating.toFixed(1)
                        : "—"}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">
                      Rating
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div className="text-center px-2">
                    <div className="text-2xl font-black text-gray-900">
                      {user.reviewCount || 0}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">
                      Reseñas
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-gray-600 leading-relaxed italic max-w-2xl">
                  {user.bio
                    ? `"${user.bio}"`
                    : "Aún no has agregado una descripción en la base de datos."}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap justify-center md:justify-start items-center text-sm text-gray-400 gap-4">
                <span>
                  📅 Miembro desde{" "}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("es-ES")
                    : "Reciente"}
                </span>
                <span>✉️ {user.email}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🚀</span> Habilidades (DB)
                </h2>
                <div className="flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-100"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Sin habilidades registradas.
                    </p>
                  )}
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">💡</span> Intereses (DB)
                </h2>
                <div className="flex flex-wrap gap-2">
                  {user.interests && user.interests.length > 0 ? (
                    user.interests.map((interest, i) => (
                      <span
                        key={i}
                        className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium border border-purple-100"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Sin intereses registrados.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Acciones
                </h2>
                <div className="space-y-3">
                  <Link
                    href="/profile/edit"
                    className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md"
                  >
                    <span>✏️ Editar en DB</span>
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

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-500 font-medium">
        Consultando microservicio de usuarios...
      </p>
    </div>
  );
}

function AccessRestricted() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="text-center bg-white p-8 rounded-3xl shadow-sm border">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Acceso Restringido
        </h1>
        <p className="text-gray-600 mb-6">
          Debes iniciar sesión para consultar tu perfil.
        </p>
        <Link
          href="/login"
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold inline-block"
        >
          Ir al Login
        </Link>
      </div>
    </div>
  );
}

function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-red-50 text-red-700 p-8 rounded-3xl border border-red-100 text-center max-w-md shadow-sm">
        <p className="text-lg font-bold mb-2">Error de Base de Datos</p>
        <p className="mb-6 text-sm opacity-80">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
        >
          Reintentar consulta
        </button>
      </div>
    </div>
  );
}
