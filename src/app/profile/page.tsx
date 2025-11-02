// src/app/profile/page.tsx
"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import RequestModal from "@/components/RequestModal";

// Interface para los datos del usuario
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
  avatar?: string;
  createdAt: string;
}

// Datos de ejemplo para proyectos (por ahora)
const mockProjects = [
  {
    id: 1,
    title: "Sistema de Detección de Emociones",
    description:
      "Programa que detecta emociones mediante análisis de texto usando Python y NLTK.",
    status: "En progreso",
    media: [
      {
        type: "image",
        url: "/api/placeholder/400/300",
        alt: "Interfaz del sistema",
      },
      {
        type: "image",
        url: "/api/placeholder/400/300",
        alt: "Diagrama de arquitectura",
      },
    ],
    links: {
      github: "https://github.com/user/emotion-detection",
      demo: "https://emotion-demo.vercel.app",
    },
  },
  {
    id: 2,
    title: "Galería de Arte Digital con React",
    description:
      "Plataforma web para exhibir arte digital con filtros inteligentes y sistema de comentarios.",
    status: "Completado",
    media: [
      {
        type: "image",
        url: "/api/placeholder/400/300",
        alt: "Galería principal",
      },
      {
        type: "video",
        url: "/api/placeholder/400/300",
        alt: "Demo de la aplicación",
      },
    ],
    links: {
      github: "https://github.com/user/digital-gallery",
      live: "https://digital-gallery.art",
    },
  },
];

export default function Profile() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/profile");
        const result = await response.json();

        if (response.ok && result.user) {
          setUserData(result.user);
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
  // Si está cargando
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

  // Si no hay sesión
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

  // Si hay error
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

  // Usar datos reales o mostrar mensaje si no hay datos
  const user = userData || {
    name: session?.user?.name || "Usuario",
    email: session?.user?.email || "",
    career: session?.user?.career || "No especificado",
    semester: session?.user?.semester || 1,
    bio: "Completa tu biografía para que otros usuarios te conozcan mejor.",
    skills: [],
    interests: [],
    rating: 0,
    reviewCount: 0,
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header del Perfil */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar y Info Básica (mantén igual) */}

              {/* Botones de Acción - ACTUALIZADO */}
              <div className="flex flex-wrap gap-3 ml-auto">
                {session?.user?.id === userData?.id ? (
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

          {/* ... (mantén el resto del perfil igual) */}

          {/* Request Button en la columna derecha - ACTUALIZADO */}
          <div className="space-y-6">
            {/* Stats (mantén igual) */}

            {/* Request Button - ACTUALIZADO */}
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

            {/* Contacto (mantén igual) */}
          </div>
        </div>
      </main>

      {/* Modal de Request */}
      {showRequestModal && userData && (
        <RequestModal
          receiverId={userData.id} // ← Usar userData.id en lugar de user.id
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
