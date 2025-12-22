"use client";

import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
// IMPORTANTE: Importamos las interfaces desde el cliente para no redefinirlas
import { ApiClient, Post, User } from "../../lib/api/client";

// BORRÉ LAS INTERFACES LOCALES 'Post' y 'User' PARA EVITAR CONFLICTOS

const careerSpaces = [
  "Todos los espacios",
  "Ingeniería en Sistemas",
  "Psicología",
  "Administración",
  "Medicina",
  "Derecho",
  "Diseño Gráfico",
  "Artes",
];

const postTypes = {
  PROJECT: { label: "Proyecto", color: "bg-blue-100 text-blue-800" },
  JOB: { label: "Empleo", color: "bg-green-100 text-green-800" },
  COLLABORATION: {
    label: "Colaboración",
    color: "bg-purple-100 text-purple-800",
  },
  ENTREPRENEURSHIP: {
    label: "Emprendimiento",
    color: "bg-orange-100 text-orange-800",
  },
  ANNOUNCEMENT: { label: "Anuncio", color: "bg-yellow-100 text-yellow-800" },
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [selectedCareer, setSelectedCareer] = useState("Todos los espacios");
  const [activeTab, setActiveTab] = useState("all");
  const [view, setView] = useState("posts");

  // Usamos los tipos importados
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [people, setPeople] = useState<User[]>([]);
  const [isLoadingPeople, setIsLoadingPeople] = useState(false);
  const [peopleError, setPeopleError] = useState("");
  const [peopleCount, setPeopleCount] = useState(0);

  // Cargar publicaciones
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);

        const result = await ApiClient.posts.getPosts({
          careerSpace:
            selectedCareer !== "Todos los espacios"
              ? selectedCareer
              : undefined,
          type: activeTab !== "all" ? activeTab : undefined,
          page: 1,
          limit: 20,
        });

        // CORRECCIÓN 1: Accedemos a result.data.posts
        if (result.success && result.data) {
          setPosts(result.data.posts || []);
        } else {
          setError(result.error || "Error al cargar publicaciones");
        }
      } catch (err) {
        setError("Error de conexión");
        console.error("Error cargando posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [selectedCareer, activeTab]);

  // Cargar personas
  useEffect(() => {
    if (view === "people") {
      loadPeople();
    }
  }, [selectedCareer, view]);

  // Función loadPeople
  const loadPeople = async () => {
    try {
      setIsLoadingPeople(true);
      setPeopleError("");

      const result = await ApiClient.users.searchUsers({
        query: "",
        career: selectedCareer !== "Todos los espacios" ? selectedCareer : "",
        page: 1,
        limit: 20,
      });

      // CORRECCIÓN 2: Accedemos a result.data.users y result.data.total
      if (result.success && result.data) {
        setPeople(result.data.users || []);
        setPeopleCount(result.data.total || 0);
      } else {
        setPeopleError(result.error || "Error al cargar personas");
      }
    } catch (err) {
      setPeopleError("Error de conexión");
    } finally {
      setIsLoadingPeople(false);
    }
  };

  // Función para renderizar estrellas
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
              Por favor inicia sesión para ver el dashboard
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header del Dashboard */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hola, {session?.user?.name} 👋
            </h1>
            <p className="text-gray-600">
              Descubre oportunidades y conecta con tu comunidad universitaria
            </p>
            <div className="mt-2 text-sm text-gray-500">
              {session?.user?.career} • {session?.user?.semester}° Semestre
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Filtros */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                {/* Selector de Vista */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Ver</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setView("posts")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        view === "posts"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Publicaciones
                    </button>
                    <button
                      onClick={() => setView("people")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        view === "people"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Personas
                    </button>
                  </div>
                </div>

                {/* Filtro por Carrera */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Espacios de Carrera
                  </h3>
                  <div className="space-y-2">
                    {careerSpaces.map((career) => (
                      <button
                        key={career}
                        onClick={() => setSelectedCareer(career)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                          selectedCareer === career
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {career}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtro por Tipo */}
                {view === "posts" && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Tipo de Publicación
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveTab("all")}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                          activeTab === "all"
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Todas las publicaciones
                      </button>
                      {Object.entries(postTypes).map(([key, { label }]) => (
                        <button
                          key={key}
                          onClick={() => setActiveTab(key.toLowerCase())}
                          className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                            activeTab === key.toLowerCase()
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón Nueva Publicación */}
                <Link
                  href="/posts/new"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium text-center block"
                >
                  + Nueva Publicación
                </Link>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Stats Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600">📊</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Publicaciones activas
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {posts.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-purple-600">👥</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {view === "posts"
                          ? "Personas en este espacio"
                          : "Oportunidades activas"}
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {view === "posts" ? peopleCount : posts.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vista de Publicaciones */}
              {view === "posts" && (
                <div className="space-y-6">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-4">
                        Cargando publicaciones...
                      </p>
                    </div>
                  ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📭</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No hay publicaciones aún
                      </h3>
                      <p className="text-gray-600">
                        Sé el primero en crear una publicación en este espacio.
                      </p>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                      >
                        {/* Header de la Publicación */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <Link href={`/profile/${post.author.id}`}>
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                                <span className="font-semibold text-gray-700">
                                  {post.author.name.charAt(0)}
                                </span>
                              </div>
                            </Link>
                            <div>
                              <Link
                                href={`/profile/${post.author.id}`}
                                className="hover:underline"
                              >
                                <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                                  {post.author.name}
                                </h3>
                              </Link>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>{post.author.career}</span>
                                <span>• {post.author.semester}° Semestre</span>
                                <span>
                                  •
                                  <div className="inline-flex items-center ml-1">
                                    {renderStars(post.author.rating || 0)}
                                  </div>
                                  <span className="ml-1">
                                    {post.author.rating
                                      ? post.author.rating.toFixed(1)
                                      : "Nuevo"}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                postTypes[post.type as keyof typeof postTypes]
                                  ?.color || "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {postTypes[post.type as keyof typeof postTypes]
                                ?.label || post.type}
                            </span>
                            <span className="text-sm text-gray-500">
                              {post.careerSpace}
                            </span>
                          </div>
                        </div>

                        {/* Contenido */}
                        <div className="mb-4">
                          <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {post.title}
                          </h2>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {post.content}
                          </p>
                        </div>

                        {/* Skills */}
                        {post.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Información */}
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                          <div className="flex space-x-4">
                            <span>
                              📅{" "}
                              {new Date(post.createdAt).toLocaleDateString(
                                "es-ES",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <div className="flex space-x-3">
                            <button className="text-gray-600 hover:text-blue-600 text-sm font-medium flex items-center space-x-1">
                              <span>💬</span>
                              <span>Comentar</span>
                            </button>
                            <button className="text-gray-600 hover:text-green-600 text-sm font-medium flex items-center space-x-1">
                              <span>🔔</span>
                              <span>Guardar</span>
                            </button>
                          </div>
                          <Link
                            href={`/posts/${post.id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
                          >
                            Ver Detalles
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Vista de Personas */}
              {view === "people" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Personas en{" "}
                      {selectedCareer === "Todos los espacios"
                        ? "todas las carreras"
                        : selectedCareer}
                    </h2>
                    <p className="text-gray-600">
                      Conecta con estudiantes y profesionales de tu comunidad
                    </p>
                  </div>

                  {isLoadingPeople ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-4">Buscando personas...</p>
                    </div>
                  ) : peopleError ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {peopleError}
                    </div>
                  ) : people.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl">
                      <div className="text-6xl mb-4">👥</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No se encontraron personas
                      </h3>
                      <p className="text-gray-600">
                        {selectedCareer === "Todos los espacios"
                          ? "Intenta con un filtro de carrera más específico."
                          : "No hay usuarios registrados en esta carrera aún."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {people.map((user) => (
                        <div
                          key={user.id}
                          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start space-x-4">
                            {/* Avatar */}
                            <Link
                              href={`/profile/${user.id}`}
                              className="shrink-0"
                            >
                              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer">
                                <span className="text-lg font-bold text-blue-600">
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                            </Link>

                            {/* Información */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <Link
                                    href={`/profile/${user.id}`}
                                    className="hover:underline"
                                  >
                                    <h3 className="font-semibold text-gray-900 text-lg">
                                      {user.name}
                                    </h3>
                                  </Link>
                                  <p className="text-gray-600 text-sm">
                                    {user.career} • {user.semester}° Semestre
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="flex items-center space-x-1">
                                    {renderStars(user.rating || 0)}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.rating
                                      ? user.rating.toFixed(1)
                                      : "Nuevo"}
                                  </span>
                                </div>
                              </div>

                              {/* Bio */}
                              {user.bio && (
                                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                                  {user.bio}
                                </p>
                              )}

                              {/* Habilidades */}
                              {user.skills.length > 0 && (
                                <div className="mb-3">
                                  <div className="flex flex-wrap gap-1">
                                    {user.skills
                                      .slice(0, 3)
                                      .map((skill, index) => (
                                        <span
                                          key={index}
                                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                    {user.skills.length > 3 && (
                                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                        +{user.skills.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Intereses */}
                              {user.interests.length > 0 && (
                                <div className="mb-4">
                                  <div className="flex flex-wrap gap-1">
                                    {user.interests
                                      .slice(0, 2)
                                      .map((interest, index) => (
                                        <span
                                          key={index}
                                          className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium"
                                        >
                                          {interest}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Acciones */}
                              <div className="flex space-x-3">
                                <Link
                                  href={`/profile/${user.id}`}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm flex-1 text-center"
                                >
                                  Ver Perfil
                                </Link>
                                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm">
                                  Seguir
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Load More */}
                  {people.length > 0 && (
                    <div className="text-center mt-8">
                      <button
                        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium"
                        onClick={loadPeople}
                      >
                        Ver más personas
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
