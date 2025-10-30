// src/app/profile/page.tsx
"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

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
    name: session.user.name || "Usuario",
    email: session.user.email || "",
    career: session.user.career || "No especificado",
    semester: session.user.semester || 1,
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
              {/* Avatar y Info Básica */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-2xl font-bold text-blue-600">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700">
                    <span className="text-xs">📷</span>
                  </button>
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
                <Link
                  href="/profile/edit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Editar Perfil
                </Link>
                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium">
                  Compartir Perfil
                </button>
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
                <p className="text-gray-700 leading-relaxed mb-4">{user.bio}</p>

                {/* Enlaces Sociales - Por implementar */}
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors opacity-50 cursor-not-allowed">
                    <span>💻</span>
                    <span className="font-medium">Agregar GitHub</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors opacity-50 cursor-not-allowed">
                    <span>💼</span>
                    <span className="font-medium">Agregar LinkedIn</span>
                  </button>
                </div>
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
                      Aún no has agregado habilidades. Edita tu perfil para
                      agregarlas.
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
                      Aún no has agregado intereses. Edita tu perfil para
                      agregarlos.
                    </p>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-3">
                  Estos intereses ayudan a conectar con personas de otras
                  disciplinas.
                </p>
              </div>

              {/* Proyectos - Por ahora con datos de ejemplo */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Mis Proyectos
                  </h2>
                  <button className="text-blue-600 hover:text-blue-700 font-medium opacity-50 cursor-not-allowed">
                    + Nuevo Proyecto
                  </button>
                </div>
                <div className="space-y-6">
                  {mockProjects.map((project) => (
                    <div
                      key={project.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {project.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {project.description}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === "Completado"
                              ? "bg-green-100 text-green-800"
                              : project.status === "En progreso"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>

                      <div className="flex space-x-3 pt-3 border-t border-gray-200">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Ver Detalles
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                          Editar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna Derecha - Stats y Acciones Rápidas */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Estadísticas
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Proyectos Completados</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Colaboraciones</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Requests Recibidos</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Intereses Compartidos</span>
                    <span className="font-semibold">
                      {user.interests.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Miembro desde</span>
                    <span className="font-semibold">
                      {userData?.createdAt
                        ? new Date(userData.createdAt).toLocaleDateString(
                            "es-ES",
                            { month: "short", year: "numeric" }
                          )
                        : "Recién"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Request Button */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  ¿Interesado en colaborar?
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Envía una solicitud a {user.name} para proponerle un proyecto
                  o colaboración.
                </p>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">
                  📨 Enviar Request
                </button>
              </div>

              {/* Contacto */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Contacto
                </h2>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-blue-600 font-medium">
                    Disponible para colaboraciones
                  </p>
                  <p className="text-gray-500 text-xs">
                    Actualiza tu perfil para personalizar tu mensaje de
                    disponibilidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
