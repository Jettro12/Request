"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiClient, type UserRequest } from "@/lib/api/client";

const requestStatusStyles = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
};

export default function RequestsPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<UserRequest[]>([]);
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
      const result = (await ApiClient.requests.getUserRequests(
        session.user.id,
        activeTab as any,
      )) as any;

      const data =
        result.data?.requests ||
        result.requests ||
        (Array.isArray(result) ? result : []);

      if (data && data.length >= 0) {
        setRequests(data);
        if (data.length === 0)
          setError("Aún no tienes solicitudes en esta categoría.");
      } else {
        setError(result.error || "Error al cargar solicitudes.");
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
        <div className="p-20 text-center uppercase font-black text-blue-600">
          Iniciando...
        </div>
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
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
                Mis Solicitudes
              </h1>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                Gestiona tus colaboraciones
              </p>
            </div>
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex space-x-1">
              {(["all", "received", "sent"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-400 hover:text-gray-600"}`}
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
            <div className="py-20 text-center font-black text-blue-600 animate-pulse uppercase">
              Cargando solicitudes...
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-gray-100">
              <span className="text-5xl mb-4 block">📭</span>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
                {error || "Todo despejado"}
              </h3>
            </div>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => {
                const isSent =
                  activeTab === "sent" ||
                  (session?.user?.id === request.fromUser?.id &&
                    activeTab === "all");
                const targetUser = isSent ? request.toUser : request.fromUser;

                return (
                  <div
                    key={request.id}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:border-blue-200 transition-all flex flex-col md:flex-row justify-between items-center gap-6"
                  >
                    <div className="flex items-start space-x-4 w-full">
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center font-black text-blue-600 text-xl shadow-inner">
                        {targetUser?.name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-black text-gray-900 uppercase tracking-tight">
                            {isSent ? "PARA: " : "DE: "}
                            {targetUser?.name || "Desconocido"}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${requestStatusStyles[request.status as keyof typeof requestStatusStyles] || "bg-gray-100 text-gray-600"}`}
                          >
                            {request.status}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed">
                          {request.message}
                        </p>
                        <div className="mt-4 flex items-center text-[10px] text-gray-300 font-black uppercase tracking-widest space-x-4">
                          <span>
                            📅{" "}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                          <span>🏷️ {request.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                      <Link
                        href={`/chat/${targetUser?.id}`}
                        className="flex-1 md:flex-none text-center bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-400 px-8 py-3 rounded-2xl text-xs font-black uppercase border border-gray-100 transition-all"
                      >
                        💬 Chat
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
