"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  career: string;
  semester: number;
  rating: number;
  bio?: string;
  skills: string[];
  interests: string[];
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const searchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/users?search=${encodeURIComponent(query)}`
        );

        if (response.ok) {
          const result = await response.json();
          setUsers(result.users);
        } else {
          setError("Error en la búsqueda");
        }
      } catch (err) {
        setError("Error de conexión");
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      searchUsers();
    } else {
      setUsers([]);
      setIsLoading(false);
    }
  }, [query]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Resultados de búsqueda
        </h1>
        {query && (
          <p className="text-gray-600">
            Buscando: "<span className="font-semibold">{query}</span>"
            {users.length > 0 && (
              <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {users.length} resultado{users.length !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Buscando usuarios...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {query
              ? "No se encontraron resultados"
              : "Ingresa un término de búsqueda"}
          </h3>
          <p className="text-gray-600">
            {query
              ? "Intenta con otras palabras clave o verifica la ortografía."
              : "Usa la barra de búsqueda para encontrar personas."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <Link href={`/profile/${user.id}`} className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer">
                    <span className="text-lg font-bold text-blue-600">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                </Link>

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
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-medium text-gray-700">
                        {user.rating || "Nuevo"}
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
    </div>
  );
}
