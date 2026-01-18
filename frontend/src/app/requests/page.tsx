"use client";

import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ApiClient, type UserRequest } from "@/lib/api/client";
import Link from "next/link";

export default function RequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async () => {
    if (!session?.user?.id) return;
    try {
      const res = (await ApiClient.requests.getUserRequests(
        session.user.id,
      )) as any;
      setRequests(res.requests || res.data?.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [session]);

  const handleAction = async (
    requestId: string,
    status: "ACCEPTED" | "REJECTED",
  ) => {
    try {
      await ApiClient.requests.updateRequestStatus(requestId, status);
      loadRequests(); // Recargar lista
    } catch (err) {
      alert("Error al actualizar el estado");
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tighter">
            Mis Solicitudes
          </h1>

          <div className="space-y-4">
            {requests.map((req) => {
              const isReceived = req.toUserId === session?.user?.id;
              const otherUser = isReceived ? req.fromUser : req.toUser;

              return (
                <div
                  key={req.id}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${req.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                      >
                        {req.status}
                      </span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {req.type}
                      </span>
                    </div>
                    <h3 className="font-black text-gray-900">
                      {otherUser?.name || "Usuario"}
                    </h3>
                    <p className="text-sm text-gray-500">{req.message}</p>
                  </div>

                  <div className="flex gap-2">
                    {/* Botones de acción solo si soy quien recibe y está pendiente */}
                    {isReceived && req.status === "PENDING" ? (
                      <>
                        <button
                          onClick={() => handleAction(req.id, "ACCEPTED")}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "REJECTED")}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold"
                        >
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <Link
                        href={`/chat/${otherUser?.id}`}
                        className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold"
                      >
                        Ver Chat
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}

            {!isLoading && requests.length === 0 && (
              <div className="text-center py-20 text-gray-400 font-bold uppercase">
                No tienes solicitudes pendientes
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
