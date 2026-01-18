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
  const [posts, setPosts] = useState<Post[]>([]);
  const [people, setPeople] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Cargar Contenido Principal
  useEffect(() => {
    const loadContent = async () => {
      // 💡 Usamos solo 'authenticated' para disparar la carga
      if (status !== "authenticated") return;

      setLoading(true);
      try {
        if (view === "posts") {
          // El microservicio de posts espera 'careerSpace'
          const params =
            selectedCareer !== "Todos los espacios"
              ? { careerSpace: selectedCareer }
              : {};

          const res = await ApiClient.posts.getPosts(params);
          const data =
            (res as any).data?.posts ||
            (res as any).posts ||
            (Array.isArray(res) ? res : []);
          setPosts(data);
        } else {
          // ✅ CORRECCIÓN: El microservicio de usuarios espera 'career'
          const params =
            selectedCareer !== "Todos los espacios"
              ? { career: selectedCareer }
              : {};

          const res = await ApiClient.users.searchUsers(params);
          const data =
            (res as any).data?.users ||
            (res as any).users ||
            (Array.isArray(res) ? res : []);
          setPeople(data);
        }
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
    // 💡 Quitamos 'status' y ponemos solo la condición de autenticación para evitar bucles
  }, [view, selectedCareer, status === "authenticated"]);
  if (status === "loading")
    return (
      <div className="p-20 text-center font-bold">Cargando aplicación...</div>
    );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <aside className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h2 className="font-bold mb-4 text-lg text-gray-900">Explorar</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setView("posts")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${view === "posts" ? "bg-blue-600 text-white font-bold shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <span>📝</span>
                  <span>Publicaciones</span>
                </button>
                <button
                  onClick={() => setView("people")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${view === "people" ? "bg-blue-600 text-white font-bold shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <span>🤝</span>
                  <span>Personas</span>
                </button>
              </nav>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h2 className="font-bold mb-4 text-lg">Filtrar Carrera</h2>
              <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                {careerSpaces.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedCareer(c.name)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${selectedCareer === c.name ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-500 hover:bg-gray-50"}`}
                  >
                    {c.emoji} {c.name}
                  </button>
                ))}
              </div>
            </div>

            <Link
              href="/posts"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-2xl font-bold shadow-lg transition-transform active:scale-95"
            >
              + Nueva Publicación
            </Link>
          </aside>

          {/* CONTENIDO */}
          <section className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 bg-gray-200 rounded-3xl" />
                ))}
              </div>
            ) : view === "posts" ? (
              posts.length > 0 ? (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white p-8 rounded-3xl shadow-sm border hover:border-blue-200 transition-all group"
                  >
                    <div className="flex justify-between mb-4">
                      <span className="text-xs font-black text-blue-500 uppercase tracking-widest">
                        {post.type}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold">
                        {post.careerSpace}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition mb-3">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 line-clamp-3 mb-6">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      <Link
                        href={`/profile/${post.author?.id}`}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                          {post.author?.name?.charAt(0) || "U"}
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                          {post.author?.name || "Usuario"}
                        </span>
                      </Link>
                      <span className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed">
                  📭 No hay publicaciones aquí.
                </div>
              )
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
                        className="font-black text-gray-900 hover:text-blue-600 text-lg block leading-tight"
                      >
                        {u.name}
                      </Link>
                      <p className="text-sm text-gray-500">
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
