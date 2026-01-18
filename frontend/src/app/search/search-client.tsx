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

        const result = (await ApiClient.users.searchUsers({
          query,
          career: "",
          skills: [],
          interests: [],
          page: 1,
          limit: 20,
        })) as any;

        if (result.success && result.data) {
          setUsers(result.data.users || []);
        } else {
          setUsers([]);
          if (!result.success) {
            setError(result.error || "Error en la búsqueda");
          }
        }
      } catch (err) {
        setError("Error de conexión");
        console.error(err);
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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Resultados de búsqueda</h1>

        {isLoading && <p>Buscando usuarios…</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded shadow">
              <Link href={`/profile/${user.id}`}>
                <h3 className="font-semibold">{user.name}</h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
