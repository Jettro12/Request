"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ApiClient, User } from "@/lib/api/client";
import RequestModal from "@/components/RequestModal";
import Link from "next/link";

export default function PublicProfilePage() {
  const { data: session } = useSession();
  const { id: userId } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) return;
      try {
        setIsLoading(true);
        setError("");
        const result = (await ApiClient.users.getUserProfile(
          userId as string,
        )) as any;

        const userData =
          (result as any).data?.user ||
          (result as any).user ||
          (result.id ? result : null);
        if (result.success && result.data?.user) {
          setUser(result.data.user);
          setError("");
        } else {
          setError(result.error || "El perfil que buscas no existe.");
        }
      } catch (err) {
        setError("Error de conexión con el servicio de usuarios");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  if (isLoading) return <LoadingScreen />;
  if (error || !user) return <ErrorDisplay error={error} />;

  const safeRating = user?.rating || 0;
  const safeReviewCount = user?.reviewCount || 0;
  const safeSkills = user?.skills || [];
  const safeInterests = user?.interests || [];
  const safeCareer = user?.career || "Estudiante";
  const safeSemester = user?.semester || "?";
  const safeBio = user?.bio || "";
  const safeName = user?.name || "Usuario";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* HEADER DEL PERFIL */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold border-4 border-white shadow-sm">
              {safeName.charAt(0)}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900">
                    {safeName}
                  </h1>
                  <p className="text-gray-500 text-lg">
                    {safeCareer} • {safeSemester}° Semestre
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4 bg-gray-50 p-3 rounded-xl border">
                  <div className="text-center px-4">
                    <div className="text-xl font-bold text-gray-900">
                      ⭐ {safeRating > 0 ? safeRating.toFixed(1) : "N/A"}
                    </div>
                    <div className="text-xs text-gray-400 uppercase">
                      Rating
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div className="text-center px-4">
                    <div className="text-xl font-bold text-gray-900">
                      {safeReviewCount}
                    </div>
                    <div className="text-xs text-gray-400 uppercase">
                      Reseñas
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-gray-700 max-w-2xl">
                {safeBio || "Sin biografía disponible."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Habilidades e Intereses */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h2 className="text-xl font-bold mb-4">Habilidades Técnicas</h2>
                <div className="flex flex-wrap gap-2">
                  {safeSkills.map((s, i) => (
                    <span
                      key={i}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h2 className="text-xl font-bold mb-4">Intereses</h2>
                <div className="flex flex-wrap gap-2">
                  {safeInterests.map((s, i) => (
                    <span
                      key={i}
                      className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* BARRA LATERAL DE ACCIONES */}
            <div className="space-y-6">
              {session?.user?.id !== user.id && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 ring-1 ring-blue-50">
                  <h3 className="font-bold text-gray-900 mb-2">
                    ¿Quieres colaborar?
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Propón un proyecto o pide ayuda a este usuario.
                  </p>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-blue-100"
                  >
                    📨 Enviar Request
                  </button>
                </div>
              )}
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-900 mb-3">Contacto</h3>
                <p className="text-sm text-gray-600 break-all">
                  ✉️ {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showRequestModal && (
        <RequestModal
          receiverId={user.id}
          receiverName={user.name}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false);
            alert("¡Solicitud enviada correctamente!");
          }}
        />
      )}
    </>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-500">Cargando perfil...</p>
    </div>
  );
}
function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow text-center max-w-sm">
        <h1 className="text-4xl mb-4">😕</h1>
        <h2 className="text-xl font-bold mb-2">Perfil no disponible</h2>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <Link href="/dashboard" className="text-blue-600 font-bold underline">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
