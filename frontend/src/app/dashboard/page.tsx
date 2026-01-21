'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ApiClient, { type Post, type User } from '@/lib/api/client';

const careerSpaces = [
  { name: 'Todos los espacios', emoji: '🌍' },
  { name: 'Ingeniería en Sistemas', emoji: '💻' },
  { name: 'Psicología', emoji: '🧠' },
  { name: 'Administración', emoji: '📊' },
  { name: 'Medicina', emoji: '⚕️' },
  { name: 'Derecho', emoji: '⚖️' },
  { name: 'Diseño Gráfico', emoji: '🎨' },
  { name: 'Artes', emoji: '🎭' },
];

// Interfaz para estandarizar la respuesta de usuarios
interface ApiUser {
  id: string;
  name?: string;
  career?: string;
  careerSpace?: string;
  semester?: number;
  email?: string;
  // Para manejar diferentes estructuras de API
  profile?: {
    career?: string;
    name?: string;
    semester?: number;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [view, setView] = useState<'posts' | 'people'>('posts');
  const [selectedCareer, setSelectedCareer] = useState('Todos los espacios');
  const [posts, setPosts] = useState<Post[]>([]);
  const [people, setPeople] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper mejorado para limpiar IDs y mostrar nombres reales
  const formatName = (name: string | null | undefined, authorId?: string) => {
    if (authorId === session?.user?.id && session?.user?.name)
      return session.user.name;
    if (!name) return 'Usuario de Request';
    if (name.startsWith('cmk') && name.length > 15)
      return 'Compañero Universitario';
    return name;
  };

  // Helper para extraer la carrera de cualquier estructura
  const getCareer = (user: ApiUser): string => {
    // Intenta diferentes estructuras de datos
    return (
      user.career ||
      user.careerSpace ||
      user.profile?.career ||
      'Carrera no especificada'
    );
  };

  // Helper para extraer el nombre de cualquier estructura
  const getName = (user: ApiUser): string => {
    return user.name || user.profile?.name || 'Usuario';
  };

  // Helper para extraer el semestre de cualquier estructura
  const getSemester = (user: ApiUser): string => {
    const semester = user.semester || user.profile?.semester;
    return semester ? `${semester}° Semestre` : '';
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    const loadContent = async () => {
      if (status !== 'authenticated') return;

      setLoading(true);
      try {
        if (view === 'posts') {
          const params =
            selectedCareer !== 'Todos los espacios'
              ? { careerSpace: selectedCareer }
              : {};
          const res = await ApiClient.posts.getPosts(params);
          console.log('Posts API response:', res); // Para debug
          const data =
            (res as any).data?.posts ||
            (res as any).posts ||
            (Array.isArray(res) ? res : []);
          setPosts(data);
        } else {
          const params =
            selectedCareer !== 'Todos los espacios'
              ? { career: selectedCareer }
              : {};
          const res = await ApiClient.users.searchUsers(params);
          console.log('Users API response:', res); // Para debug

          // Manejo flexible de la respuesta
          let data: ApiUser[] = [];

          if (Array.isArray(res)) {
            data = res;
          } else if ((res as any)?.data?.users) {
            data = (res as any).data.users;
          } else if ((res as any)?.users) {
            data = (res as any).users;
          } else if ((res as any)?.data) {
            // Si data es directamente un array
            data = Array.isArray((res as any).data) ? (res as any).data : [];
          }

          setPeople(data);

          // Debug: verificar la estructura de cada usuario
          if (data.length > 0) {
            console.log('Primer usuario en data:', data[0]);
            console.log('Carrera del primer usuario:', getCareer(data[0]));
          }
        }
      } catch (err) {
        console.error('Error cargando dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [view, selectedCareer, status === 'authenticated']);

  if (status === 'loading')
    return (
      <div className="p-20 text-center font-bold text-gray-900 uppercase tracking-widest">
        Cargando aplicación...
      </div>
    );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-4 gap-8">
          <aside className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="font-black mb-4 text-xs text-gray-400 uppercase tracking-[0.2em]">
                Explorar
              </h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setView('posts')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    view === 'posts'
                      ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">📝</span>
                  <span className="font-bold uppercase text-xs tracking-wider">
                    Publicaciones
                  </span>
                </button>
                <button
                  onClick={() => setView('people')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    view === 'people'
                      ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">🤝</span>
                  <span className="font-bold uppercase text-xs tracking-wider">
                    Personas
                  </span>
                </button>
              </nav>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="font-black mb-4 text-xs text-gray-400 uppercase tracking-[0.2em]">
                Filtrar Facultad
              </h2>
              <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {careerSpaces.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedCareer(c.name)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                      selectedCareer === c.name
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {c.emoji} {c.name}
                  </button>
                ))}
              </div>
            </div>

            <Link
              href="/posts"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95"
            >
              + Nueva Publicación
            </Link>
          </aside>

          <section className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-[2rem]" />
                ))}
              </div>
            ) : view === 'posts' ? (
              posts.length > 0 ? (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-blue-200 transition-all group"
                  >
                    <div className="flex justify-between mb-4">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-full">
                        {post.type}
                      </span>
                      <span className="text-[10px] bg-gray-100 px-3 py-1 rounded-full font-black text-gray-400 uppercase tracking-tighter">
                        {post.careerSpace}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition mb-3 leading-tight tracking-tighter">
                      {post.title}
                    </h2>
                    <p className="text-gray-500 line-clamp-3 mb-6 leading-relaxed font-medium">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      <Link
                        href={`/profile/${post.author?.id}`}
                        className="flex items-center space-x-3 group/author"
                      >
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100 group-hover/author:scale-110 transition-transform">
                          {formatName(post.author?.name, post.author?.id)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-black text-gray-900 group-hover/author:text-blue-600 block transition-colors">
                            {formatName(post.author?.name, post.author?.id)}
                          </span>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {/* Usa el helper para la carrera también en posts */}
                            {getCareer(post.author as ApiUser) || 'Estudiante'}
                          </p>
                        </div>
                      </Link>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 font-black uppercase tracking-widest">
                    📭 No hay publicaciones aquí.
                  </p>
                </div>
              )
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {people.length > 0 ? (
                  people.map((user) => {
                    const userCareer = getCareer(user);
                    const userName = getName(user);
                    const userSemester = getSemester(user);

                    return (
                      <div
                        key={user.id}
                        className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-xl hover:border-blue-200 transition-all"
                      >
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-100">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/profile/${user.id}`}
                            className="font-black text-gray-900 hover:text-blue-600 text-lg block leading-tight transition-colors tracking-tighter"
                          >
                            {userName}
                          </Link>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mt-1">
                            {userCareer}
                          </p>
                          {userSemester && (
                            <p className="text-[9px] text-gray-500 font-medium mt-0.5">
                              {userSemester}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-black uppercase tracking-widest">
                      👥 No hay personas en esta categoría.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
