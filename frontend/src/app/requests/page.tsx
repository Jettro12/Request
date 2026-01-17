"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiClient, Request } from "@/lib/api/client";

const requestStatusStyles = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
};

export default function RequestsPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "received" | "sent">(
    "all",
  );

  const loadRequests = async () => {
    if (!session?.user?.id) return;
    try {
      setIsLoading(true);
      setError("");
      const result = await ApiClient.requests.getUserRequests(
        session.user.id,
        activeTab,
      );

      if (result.success && result.data?.requests) {
        setRequests(result.data.requests);
        setError(""); // Aseguramos limpieza en éxito
      } else {
        setRequests([]);
        setError(
          result.error || "Aún no tienes solicitudes en esta categoría.",
        );
      }
    } catch (err) {
      setError("Fallo de conexión al cargar solicitudes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") loadRequests();
  }, [activeTab, status]);

  if (status === "loading")
    return (
      <>
        <Header />
        <div className="p-20 text-center">Iniciando...</div>
      </>
    );
  if (status === "unauthenticated")
    return (
      <>
        <Header />
        <div className="p-20 text-center">No autorizado</div>
      </>
    );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Mis Solicitudes
              </h1>
              <p className="text-gray-500">
                Gestiona tus colaboraciones y proyectos
              </p>
            </div>

            {/* TABS SELECTOR */}
            <div className="bg-white p-1 rounded-xl shadow-sm border flex space-x-1">
              {(["all", "received", "sent"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {tab === "all"
                    ? "Todas"
                    : tab === "received"
                      ? "Recibidas"
                      : "Enviadas"}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-100">
              <span className="text-5xl mb-4 block">📭</span>
              <h3 className="text-xl font-bold text-gray-900">
                {error || "Todo despejado"}
              </h3>
              <p className="text-gray-500 mt-2">
                Aquí aparecerán tus solicitudes de colaboración.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl shadow-sm border p-6 hover:border-blue-200 transition-all flex flex-col md:flex-row justify-between gap-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                      {(activeTab === "sent"
                        ? request.toUser.name
                        : request.fromUser.name
                      ).charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-bold text-gray-900">
                          {activeTab === "sent"
                            ? `Para: ${request.toUser.name}`
                            : `De: ${request.fromUser.name}`}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${requestStatusStyles[request.status as keyof typeof requestStatusStyles]}`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed max-w-xl">
                        {request.message}
                      </p>
                      <div className="mt-4 flex items-center text-xs text-gray-400 space-x-4 font-medium">
                        <span>
                          📅 {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                        <span>🏷️ {request.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/chat/${activeTab === "sent" ? request.toUser.id : request.fromUser.id}`}
                      className="flex-1 md:flex-none text-center bg-gray-50 hover:bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold border transition"
                    >
                      💬 Chat
                    </Link>
                    {activeTab === "received" &&
                      request.status === "PENDING" && (
                        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition">
                          Aceptar
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
