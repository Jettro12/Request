"use client";

import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiClient, type Post, type User } from "@/lib/api/client";

/* =========================
   TIPOS
========================= */

interface CareerSpace {
  name: string;
  emoji?: string;
}

interface PostType {
  label: string;
  color: string;
}

interface PostAuthor {
  id: string;
  name: string;
  career?: string;
  semester?: number;
  rating?: number;
  skills?: string[];
}

/* =========================
   CONSTANTES
========================= */

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

/* =========================
   COMPONENTES AUX
========================= */

const RatingStars = ({ rating = 0 }: { rating?: number }) => {
  const rounded = Math.round(rating);
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={s <= rounded ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
    </div>
  );
};

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
  <div className="bg-white rounded-xl p-12 text-center">
    <div className="text-6xl mb-4">{emoji}</div>
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-gray-600 mt-2">{message}</p>
  </div>
);

/* =========================
   AVATAR (FIX TAILWIND)
========================= */

const UserAvatar = ({
  user,
  size = 10,
}: {
  user: User | PostAuthor;
  size?: number;
}) => (
  <Link href={`/profile/${user.id}`}>
    <div
      style={{ width: size * 4, height: size * 4 }}
      className="bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 cursor-pointer"
    >
      <span className="font-semibold text-gray-700">
        {user.name?.charAt(0) || "U"}
      </span>
    </div>
  </Link>
);

/* =========================
   DASHBOARD
========================= */

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [view, setView] = useState<"posts" | "people">("posts");
  const [selectedCareer, setSelectedCareer] = useState("Todos los espacios");
  const [activeTab, setActiveTab] = useState("all");

  const [posts, setPosts] = useState<Post[]>([]);
  const [people, setPeople] = useState<User[]>([]);
  const [peopleCount, setPeopleCount] = useState(0);

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [peopleError, setPeopleError] = useState("");

  /* ---------- Auth ---------- */

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  /* ---------- Load Posts ---------- */

  useEffect(() => {
    if (view !== "posts") return;

    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        setPostsError("");

        const params: any = { page: 1, limit: 20 };

        if (selectedCareer !== "Todos los espacios")
          params.careerSpace = selectedCareer;

        if (activeTab !== "all") params.type = activeTab;

        const result = await ApiClient.posts.getPosts(params);

        if (result.success && result.posts) {
          setPosts(result.posts);
        } else {
          setPosts([]);
          setPostsError(result.error || "Error cargando publicaciones");
        }
      } catch {
        setPostsError("Error de conexión con posts-service");
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    loadPosts();
  }, [view, selectedCareer, activeTab]);

  /* ---------- Load People ---------- */

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

        if (result.success && result.users) {
          setPeople(result.users);
          setPeopleCount(result.total || 0);
        } else {
          setPeople([]);
          setPeopleCount(0);
          setPeopleError(result.error || "Error cargando usuarios");
        }
      } catch {
        setPeopleError("Error de conexión con users-service");
        setPeople([]);
        setPeopleCount(0);
      } finally {
        setLoadingPeople(false);
      }
    };

    loadPeople();
  }, [view, selectedCareer]);

  /* ---------- Loading ---------- */

  if (status === "loading") {
    return (
      <>
        <Header />
        <LoadingSpinner />
      </>
    );
  }

  if (status !== "authenticated") return null;

  /* =========================
     RENDER
  ========================= */

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <aside className="bg-white p-6 rounded-xl space-y-6">
            <button
              onClick={() => setView("posts")}
              className={`w-full py-2 rounded ${
                view === "posts" ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              Publicaciones
            </button>
            <button
              onClick={() => setView("people")}
              className={`w-full py-2 rounded ${
                view === "people" ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              Personas
            </button>

            {careerSpaces.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedCareer(c.name)}
                className={`block w-full text-left px-3 py-2 rounded ${
                  selectedCareer === c.name
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                {c.emoji} {c.name}
              </button>
            ))}

            <Link
              href="/posts"
              className="block text-center bg-blue-600 text-white py-2 rounded"
            >
              + Nueva Publicación
            </Link>
          </aside>

          {/* MAIN */}
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
                  message="Crea la primera publicación"
                />
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white p-6 rounded-xl shadow-sm"
                  >
                    <h2 className="text-xl font-bold">{post.title}</h2>
                    <p className="text-gray-700 mt-2">{post.content}</p>
                  </div>
                ))
              )
            ) : loadingPeople ? (
              <LoadingSpinner />
            ) : peopleError ? (
              <EmptyState emoji="❌" title="Error" message={peopleError} />
            ) : (
              people.map((u) => (
                <div key={u.id} className="bg-white p-6 rounded-xl">
                  <Link href={`/profile/${u.id}`}>
                    <h3 className="font-semibold">{u.name}</h3>
                  </Link>
                </div>
              ))
            )}
          </section>
        </div>
      </main>
    </>
  );
}
