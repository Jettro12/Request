"use client";

import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiClient, type Post, type User } from "@/lib/api/client";

/* =========================
    TIPOS & CONSTANTES
========================= */

interface CareerSpace {
  name: string;
  emoji?: string;
}

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

/* =========================
    COMPONENTES AUXILIARES
========================= */

const LoadingSpinner = () => (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
    <p className="mt-4 text-gray-600">Cargando...</p>
  </div>
);

const EmptyState = ({
  emoji,
  title,
  message,
}: {
  emoji: string;
  title: string;
  message: string;
}) => (
  <div className="bg-white rounded-xl p-12 text-center shadow-sm">
    <div className="text-6xl mb-4">{emoji}</div>
    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    <p className="text-gray-600 mt-2">{message}</p>
  </div>
);

/* =========================
    DASHBOARD MAIN
========================= */

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [view, setView] = useState<"posts" | "people">("posts");
  const [selectedCareer, setSelectedCareer] = useState("Todos los espacios");
  const [activeTab, setActiveTab] = useState("all");

  const [posts, setPosts] = useState<Post[]>([]);
  const [people, setPeople] = useState<User[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [peopleError, setPeopleError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  /* ---------- Cargar Publicaciones ---------- */
  useEffect(() => {
    if (view !== "posts") return;

    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        setPostsError(""); // Resetear error al iniciar

        const params: any = { page: 1, limit: 20 };
        if (selectedCareer !== "Todos los espacios")
          params.careerSpace = selectedCareer;
        if (activeTab !== "all") params.type = activeTab;

        const result = await ApiClient.posts.getPosts(params);

        if (result.success && result.data?.posts) {
          setPosts(result.data.posts);
          setPostsError(""); // ✅ ÉXITO: Limpiamos cualquier error
        } else {
          setPosts([]);
          setPostsError(result.error || "No se encontraron publicaciones");
        }
      } catch (err) {
        setPostsError("Error de conexión con el servidor");
      } finally {
        setLoadingPosts(false);
      }
    };

    loadPosts();
  }, [view, selectedCareer, activeTab]);

  /* ---------- Cargar Personas ---------- */
  useEffect(() => {
    if (view !== "people") return;

    const loadPeople = async () => {
      try {
        setLoadingPeople(true);
        setPeopleError("");

        const params: any = { page: 1, limit: 20 };
        if (selectedCareer !== "Todos los espacios")
          params.career = selectedCareer;

        const result = await ApiClient.users.searchUsers(params);

        if (result.success && result.data?.users) {
          setPeople(result.data.users);
          setPeopleError(""); // ✅ ÉXITO: Limpiamos error
        } else {
          setPeople([]);
          setPeopleError(result.error || "No se encontraron usuarios");
        }
      } catch (err) {
        setPeopleError("Error de conexión con el servicio de usuarios");
      } finally {
        setLoadingPeople(false);
      }
    };

    loadPeople();
  }, [view, selectedCareer]);

  if (status === "loading")
    return (
      <>
        <Header />
        <LoadingSpinner />
      </>
    );
  if (status !== "authenticated") return null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <aside className="bg-white p-6 rounded-xl space-y-4 shadow-sm h-fit">
            <h2 className="font-bold text-gray-800 border-b pb-2">Vistas</h2>
            <button
              onClick={() => setView("posts")}
              className={`w-full py-2 px-4 rounded-lg transition ${
                view === "posts"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Publicaciones
            </button>
            <button
              onClick={() => setView("people")}
              className={`w-full py-2 px-4 rounded-lg transition ${
                view === "people"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Personas
            </button>

            <h2 className="font-bold text-gray-800 border-b pb-2 pt-4">
              Carreras
            </h2>
            <div className="space-y-1">
              {careerSpaces.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCareer(c.name)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    selectedCareer === c.name
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>

            <Link
              href="/posts"
              className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition mt-4"
            >
              + Nueva Publicación
            </Link>
          </aside>

          {/* CONTENIDO PRINCIPAL */}
          <section className="lg:col-span-3 space-y-6">
            {view === "posts" ? (
              loadingPosts ? (
                <LoadingSpinner />
              ) : postsError ? (
                <EmptyState emoji="❌" title="Error" message={postsError} />
              ) : posts.length === 0 ? (
                <EmptyState
                  emoji="📭"
                  title="Sin publicaciones"
                  message="Aún no hay nada para mostrar aquí."
                />
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold text-gray-800">
                        {post.title}
                      </h2>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold uppercase">
                        {post.type}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {post.content}
                    </p>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                      <span>{post.careerSpace}</span>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )
            ) : loadingPeople ? (
              <LoadingSpinner />
            ) : peopleError ? (
              <EmptyState emoji="❌" title="Error" message={peopleError} />
            ) : people.length === 0 ? (
              <EmptyState
                emoji="👥"
                title="No hay usuarios"
                message="Prueba con otra carrera."
              />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {people.map((u) => (
                  <div
                    key={u.id}
                    className="bg-white p-4 rounded-xl shadow-sm flex items-center space-x-4 border border-gray-50"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {u.name?.charAt(0)}
                    </div>
                    <div>
                      <Link
                        href={`/profile/${u.id}`}
                        className="font-bold text-gray-800 hover:text-blue-600"
                      >
                        {u.name}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {u.career || "Estudiante"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
