"use client";

import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiClient, type Post, type User } from "@/lib/api/client";

const careerSpaces = [
  { name: "Todos los espacios", emoji: "🌍" },
  { name: "Ingeniería en Sistemas", emoji: "💻" },
  { name: "Psicología", emoji: "🧠" },
  { name: "Administración", emoji: "📊" },
  { name: "Medicina", emoji: "⚕️" },
  { name: "Derecho", emoji: "⚖️" },
  { name: "Diseño Gráfico", emoji: "🎨" },
  { name: "Artes", emoji: "🎭" },
];

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

  useEffect(() => {
    if (view !== "posts" || status !== "authenticated") return;
    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        setPostsError("");
        const params: any = { page: 1, limit: 20 };
        if (selectedCareer !== "Todos los espacios")
          params.careerSpace = selectedCareer;
        if (activeTab !== "all") params.type = activeTab;

        const result = await ApiClient.posts.getPosts(params);
        const data =
          result.data?.posts ||
          result.posts ||
          (Array.isArray(result) ? result : []);

        if (data.length > 0) {
          setPosts(data);
          setPostsError("");
        } else {
          setPosts([]);
          setPostsError(
            result.error || "No hay publicaciones en esta categoría.",
          );
        }
      } catch (err) {
        setPostsError("Error al conectar con el microservicio de posts.");
      } finally {
        setLoadingPosts(false);
      }
    };
    loadPosts();
  }, [view, selectedCareer, activeTab, status]);

  useEffect(() => {
    if (view !== "people" || status !== "authenticated") return;
    const loadPeople = async () => {
      try {
        setLoadingPeople(true);
        setPeopleError("");
        const params: any = { page: 1, limit: 20 };
        if (selectedCareer !== "Todos los espacios")
          params.career = selectedCareer;

        const result = await ApiClient.users.searchUsers(params);
        const data =
          result.data?.users ||
          result.users ||
          (Array.isArray(result) ? result : []);

        if (data.length > 0) {
          setPeople(data);
          setPeopleError("");
        } else {
          setPeople([]);
          setPeopleError("No se encontraron estudiantes.");
        }
      } catch (err) {
        setPeopleError("Error al conectar con el microservicio de usuarios.");
      } finally {
        setLoadingPeople(false);
      }
    };
    loadPeople();
  }, [view, selectedCareer, status]);

  if (status === "loading") return <LoadingSpinner />;
  if (status !== "authenticated") return null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8 font-sans">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-4 gap-8">
          <aside className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 px-2 text-lg">
                Explorar
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setView("posts")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${view === "posts" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <span className="text-xl">📝</span>
                  <span className="font-bold">Publicaciones</span>
                </button>
                <button
                  onClick={() => setView("people")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${view === "people" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <span className="text-xl">🤝</span>
                  <span className="font-bold">Personas</span>
                </button>
              </div>
            </div>
            <Link
              href="/posts"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-2xl font-bold shadow-lg"
            >
              + Nueva Publicación
            </Link>
          </aside>

          <section className="lg:col-span-3 space-y-6">
            {view === "posts" &&
              (loadingPosts ? (
                <FeedSkeleton />
              ) : postsError ? (
                <EmptyState emoji="❌" title="Error" message={postsError} />
              ) : posts.length === 0 ? (
                <EmptyState
                  emoji="📭"
                  title="Vacío"
                  message="Nada que mostrar."
                />
              ) : (
                <div className="grid gap-6">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs font-black uppercase text-blue-500 mb-2 block">
                            {post.type}
                          </span>
                          <h2 className="text-2xl font-extrabold text-gray-900">
                            {post.title}
                          </h2>
                        </div>
                      </div>
                      <p className="text-gray-600 line-clamp-3 mb-6">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between pt-6 border-t">
                        <Link
                          href={`/profile/${post.author?.id}`}
                          className="flex items-center space-x-3 group"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border-2 border-white">
                            {(post.author?.name || "U").charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition">
                            {post.author?.name || "Usuario"}
                          </span>
                        </Link>
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

            {view === "people" &&
              (loadingPeople ? (
                <FeedSkeleton />
              ) : peopleError ? (
                <EmptyState emoji="❌" title="Error" message={peopleError} />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {people.map((u) => (
                    <div
                      key={u.id}
                      className="bg-white p-6 rounded-2xl shadow-sm border flex items-center space-x-4 hover:shadow-md transition-all"
                    >
                      <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {u.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/profile/${u.id}`}
                          className="font-black text-gray-900 hover:text-blue-600 text-lg leading-tight block"
                        >
                          {u.name}
                        </Link>
                        <p className="text-sm text-gray-500 font-medium">
                          {u.career || "Estudiante"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </section>
        </div>
      </main>
    </>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-400 font-bold tracking-widest text-xs uppercase">
        Sincronizando...
      </p>
    </div>
  );
}
function FeedSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-200 h-48 rounded-3xl w-full"></div>
      ))}
    </div>
  );
}
function EmptyState({
  emoji,
  title,
  message,
}: {
  emoji: string;
  title: string;
  message: string;
}) {
  return (
    <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-100">
      <div className="text-6xl mb-4">{emoji}</div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-2">{message}</p>
    </div>
  );
}
