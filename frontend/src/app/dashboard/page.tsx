"use client";

import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiClient, type Post, type User } from "@/lib/api/client";

// Tipos para las props del componente
interface CareerSpace {
  name: string;
  emoji?: string;
}

interface PostType {
  label: string;
  color: string;
}

// Tipo simplificado para autor de posts (para evitar errores de tipos)
interface PostAuthor {
  id: string;
  name: string;
  career?: string;
  semester?: number;
  rating?: number;
  skills?: string[];
}

// Constantes
const careerSpaces: CareerSpace[] = [
  { name: "Todos los espacios", emoji: "🌍" },
  { name: "Ingeniería en Sistemas", emoji: "💻" },
  { name: "Psicología", emoji: "🧠" },
  { name: "Administración", emoji: "📊" },
  { name: "Medicina", emoji: "⚕️" },
  { name: "Derecho", emoji: "⚖️" },
  { name: "Diseño Gráfico", emoji: "🎨" },
  { name: "Artes", emoji: "🎭" },
];

const postTypes: Record<string, PostType> = {
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

// Componentes auxiliares
const RatingStars = ({ rating = 0 }: { rating?: number }) => {
  const roundedRating = Math.round(rating);
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-sm ${
            star <= roundedRating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
    <p className="text-gray-600 mt-4">Cargando...</p>
  </div>
);

const EmptyState = ({
  emoji = "📭",
  title,
  message,
}: {
  emoji?: string;
  title: string;
  message: string;
}) => (
  <div className="text-center py-12 bg-white rounded-xl">
    <div className="text-6xl mb-4">{emoji}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{message}</p>
  </div>
);

// UserAvatar actualizado para aceptar tanto User como PostAuthor
const UserAvatar = ({
  user,
  size = 10,
}: {
  user: User | PostAuthor;
  size?: number;
}) => (
  <Link href={`/profile/${user.id}`}>
    <div
      className={`w-${size} h-${size} bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors`}
    >
      <span className="font-semibold text-gray-700">
        {user.name?.charAt(0) || "U"}
      </span>
    </div>
  </Link>
);

// Componente principal
export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Estados
  const [selectedCareer, setSelectedCareer] = useState("Todos los espacios");
  const [activeTab, setActiveTab] = useState("all");
  const [view, setView] = useState<"posts" | "people">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");
  const [people, setPeople] = useState<User[]>([]);
  const [isLoadingPeople, setIsLoadingPeople] = useState(false);
  const [peopleError, setPeopleError] = useState("");
  const [peopleCount, setPeopleCount] = useState(0);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Cargar publicaciones - VERSIÓN CORREGIDA
  useEffect(() => {
    const loadPosts = async () => {
      if (view !== "posts") return;

      try {
        setIsLoadingPosts(true);
        setPostsError("");

        // PREPARAR PARÁMETROS CORRECTAMENTE - SIN undefined
        const params: any = {
          page: 1,
          limit: 20,
        };

        // Solo agregar careerSpace si tiene un valor válido (no "Todos los espacios")
        if (selectedCareer && selectedCareer !== "Todos los espacios") {
          params.careerSpace = selectedCareer;
        }

        // Solo agregar type si tiene un valor válido (no "all")
        if (activeTab && activeTab !== "all") {
          // El backend espera PROJECT, JOB, etc. en mayúsculas
          params.type = activeTab;
        }

        console.log("📡 Dashboard: Cargando posts con parámetros:", params);

        const result = await ApiClient.posts.getPosts(params);

        if (result.success && result.data?.posts) {
          setPosts(result.data.posts);
        } else {
          setPostsError(result.error || "Error al cargar publicaciones");
          setPosts([]);
        }
      } catch (err) {
        console.error("Error cargando posts:", err);
        setPostsError(
          "Error de conexión con el servidor de posts (puerto 4002)"
        );
        setPosts([]);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    loadPosts();
  }, [selectedCareer, activeTab, view]);

  // Cargar personas - VERSIÓN CORREGIDA
  useEffect(() => {
    const loadPeople = async () => {
      if (view !== "people") return;

      try {
        setIsLoadingPeople(true);
        setPeopleError("");

        const params: any = {
          page: 1,
          limit: 20,
        };

        // Solo agregar carrera si no es "Todos los espacios"
        if (selectedCareer && selectedCareer !== "Todos los espacios") {
          params.career = selectedCareer;
        }

        console.log("👥 Dashboard: Cargando personas con parámetros:", params);

        const result = await ApiClient.users.searchUsers(params);

        if (result.success && result.data) {
          setPeople(result.data.users || []);
          setPeopleCount(result.data.total || 0);
        } else {
          setPeopleError(result.error || "Error al cargar personas");
          setPeople([]);
          setPeopleCount(0);
        }
      } catch (err) {
        console.error("Error cargando personas:", err);
        setPeopleError("Error de conexión con el servidor de usuarios");
        setPeople([]);
        setPeopleCount(0);
      } finally {
        setIsLoadingPeople(false);
      }
    };

    if (view === "people") {
      loadPeople();
    }
  }, [selectedCareer, view]);

  // Si está cargando la sesión
  if (status === "loading") {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }
  // Si no hay sesión después de cargar
  if (status !== "authenticated") {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Acceso restringido
            </h1>
            <p className="text-gray-600 mb-6">
              Debes iniciar sesión para acceder al dashboard
            </p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Renderizar contenido principal
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header del Dashboard */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hola, {session.user?.name || "Usuario"} 👋
            </h1>
            <p className="text-gray-600">
              Descubre oportunidades y conecta con tu comunidad universitaria
            </p>
            <div className="mt-2 text-sm text-gray-500 flex items-center space-x-2">
              <span>{session.user?.career || "Carrera no especificada"}</span>
              <span>•</span>
              <span>{session.user?.semester || "?"}° Semestre</span>
              {session.user?.rating !== undefined && (
                <>
                  <span>•</span>
                  <div className="flex items-center">
                    <RatingStars rating={session.user.rating} />
                    <span className="ml-1">
                      ({session.user.rating.toFixed(1)})
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Sidebar - Filtros */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8 space-y-6">
                {/* Selector de Vista */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Ver</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setView("posts")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        view === "posts"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Publicaciones
                    </button>
                    <button
                      onClick={() => setView("people")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Espacios de Carrera
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {careerSpaces.map((career) => (
                      <button
                        key={career.name}
                        onClick={() => setSelectedCareer(career.name)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 ${
                          selectedCareer === career.name
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {career.emoji && <span>{career.emoji}</span>}
                        <span className="truncate">{career.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtro por Tipo de Publicación */}
                {view === "posts" && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Tipo de Publicación
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveTab("all")}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
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
                          onClick={() => setActiveTab(key)} // Usar key directamente (PROJECT, JOB, etc.)
                          className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeTab === key
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
                  href="/posts"
                  className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium text-center transition-colors"
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
                        {view === "posts"
                          ? "Publicaciones activas"
                          : "Oportunidades activas"}
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {view === "posts" ? posts.length : peopleCount}
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
                          : "Personas conectadas"}
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {view === "posts" ? peopleCount : posts.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido principal según vista */}
              {view === "posts" ? (
                <PostsView
                  posts={posts}
                  isLoading={isLoadingPosts}
                  error={postsError}
                  postTypes={postTypes}
                />
              ) : (
                <PeopleView
                  people={people}
                  isLoading={isLoadingPeople}
                  error={peopleError}
                  selectedCareer={selectedCareer}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// Componente para vista de publicaciones
function PostsView({
  posts,
  isLoading,
  error,
  postTypes,
}: {
  posts: Post[];
  isLoading: boolean;
  error: string;
  postTypes: Record<string, PostType>;
}) {
  if (isLoading) return <LoadingSpinner />;

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Error:</p>
        <p>{error}</p>
      </div>
    );

  if (posts.length === 0)
    return (
      <EmptyState
        emoji="📭"
        title="No hay publicaciones aún"
        message="Sé el primero en crear una publicación en este espacio."
      />
    );

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} postTypes={postTypes} />
      ))}
    </div>
  );
}

// Componente para tarjeta de publicación
function PostCard({
  post,
  postTypes,
}: {
  post: Post;
  postTypes: Record<string, PostType>;
}) {
  const postType = postTypes[post.type as keyof typeof postTypes];

  // Crear objeto author compatible
  const authorData: PostAuthor = {
    id: post.author.id,
    name: post.author.name,
    career: post.author.career,
    semester: post.author.semester,
    rating: post.author.rating,
    skills: post.author.skills,
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <UserAvatar user={authorData} />
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
              <span>{post.author.career || "Sin carrera"}</span>
              <span>• {post.author.semester || "?"}° Semestre</span>
              <span>•</span>
              <div className="inline-flex items-center">
                <RatingStars rating={post.author.rating || 0} />
                <span className="ml-1">
                  {post.author.rating ? post.author.rating.toFixed(1) : "Nuevo"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {postType && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${postType.color}`}
            >
              {postType.label}
            </span>
          )}
          <span className="text-sm text-gray-500">{post.careerSpace}</span>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
      </div>

      {post.skills && post.skills.length > 0 && (
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

      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
        <div className="flex space-x-4">
          <span>
            📅{" "}
            {new Date(post.createdAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  );
}

// Componente para vista de personas
function PeopleView({
  people,
  isLoading,
  error,
  selectedCareer,
}: {
  people: User[];
  isLoading: boolean;
  error: string;
  selectedCareer: string;
}) {
  if (isLoading) return <LoadingSpinner />;

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Error:</p>
        <p>{error}</p>
      </div>
    );

  if (people.length === 0)
    return (
      <EmptyState
        emoji="👥"
        title="No se encontraron personas"
        message={
          selectedCareer === "Todos los espacios"
            ? "Intenta con un filtro de carrera más específico."
            : "No hay usuarios registrados en esta carrera aún."
        }
      />
    );

  return (
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

      <div className="grid md:grid-cols-2 gap-6">
        {people.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {/* Botón para cargar más */}
      {people.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={() => {
              /* Implementar paginación aquí */
            }}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Ver más personas
          </button>
        </div>
      )}
    </div>
  );
}

// Componente para tarjeta de usuario
function UserCard({ user }: { user: User }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <UserAvatar user={user} size={16} />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <Link href={`/profile/${user.id}`} className="hover:underline">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {user.name}
                </h3>
              </Link>
              <p className="text-gray-600 text-sm">
                {user.career || "Sin carrera"} • {user.semester || "?"}°
                Semestre
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <RatingStars rating={user.rating || 0} />
              <span className="text-sm font-medium text-gray-700">
                {user.rating ? user.rating.toFixed(1) : "Nuevo"}
              </span>
            </div>
          </div>

          {user.bio && (
            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
              {user.bio}
            </p>
          )}

          {user.skills && user.skills.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {user.skills.slice(0, 3).map((skill, index) => (
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

          {user.interests && user.interests.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {user.interests.slice(0, 2).map((interest, index) => (
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

          <div className="flex space-x-3">
            <Link
              href={`/profile/${user.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm flex-1 text-center transition-colors"
            >
              Ver Perfil
            </Link>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
              Seguir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
