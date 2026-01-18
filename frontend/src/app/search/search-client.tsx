"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ApiClient, User } from "../../lib/api/client";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const searchUsers = async () => {
      try {
        setIsLoading(true);
        setError("");

        const result = (await ApiClient.users.searchUsers({
          query,
          page: 1,
          limit: 20,
        })) as any;

        const data =
          result.data?.users ||
          result.users ||
          (Array.isArray(result) ? result : []);
        setUsers(data);

        if (!result.success && data.length === 0) {
          setError(result.error || "No se encontraron resultados");
        }
      } catch (err) {
        setError("Error de conexión con el servidor");
      } finally {
        setIsLoading(false);
      }
    };

    if (query.trim()) {
      searchUsers();
    } else {
      setUsers([]);
      setIsLoading(false);
    }
  }, [query]);

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
            Resultados para: <span className="text-blue-600">"{query}"</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">
            Se encontraron {users.length} usuarios
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 font-black text-blue-600 animate-pulse uppercase">
            Buscando talento...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl text-center font-bold">
            {error}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-100">
                    {user.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/profile/${user.id}`}
                      className="font-black text-gray-900 group-hover:text-blue-600 text-lg block transition-colors leading-tight"
                    >
                      {user.name}
                    </Link>
                    <p className="text-xs font-bold text-gray-400 uppercase mt-1">
                      {user.career || "Estudiante"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    Ver Perfil Completo
                  </span>
                  <div className="text-blue-600 text-lg">→</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && users.length === 0 && !error && (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
            <span className="text-5xl block mb-4">🕵️‍♂️</span>
            <p className="text-gray-400 font-bold uppercase tracking-tighter text-xl">
              No hay coincidencias en la base de datos
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
