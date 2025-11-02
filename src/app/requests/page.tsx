"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Request {
  id: string;
  type: string;
  message: string;
  status: string;
  createdAt: string;
  fromUser: {
    id: string;
    name: string;
    career: string;
    semester: number;
    rating: number;
    skills: string[];
  };
  toUser: {
    id: string;
    name: string;
    career: string;
    semester: number;
    rating: number;
    skills: string[];
  };
  _count: {
    messages: number;
  };
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
    };
  }>;
}

const requestStatus = {
  PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  ACCEPTED: { label: "Aceptada", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rechazada", color: "bg-red-100 text-red-800" },
  COMPLETED: { label: "Completada", color: "bg-blue-100 text-blue-800" },
};

const requestTypes = {
  COLLABORATION: {
    label: "🤝 Colaboración",
    color: "bg-purple-100 text-purple-800",
  },
  ADVICE: { label: "💡 Asesoría", color: "bg-orange-100 text-orange-800" },
  JOB_OFFER: { label: "💼 Trabajo", color: "bg-green-100 text-green-800" },
  MENTORSHIP: { label: "🎓 Mentoría", color: "bg-blue-100 text-blue-800" },
};

export default function RequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "received" | "sent">(
    "all"
  );
  const [acceptingRequest, setAcceptingRequest] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const loadRequests = async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/requests?type=${activeTab}`);
      const result = await response.json();

      if (response.ok) {
        setRequests(result.requests);
      } else {
        setError(result.error || "Error al cargar las solicitudes");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (requestId: string, otherUserId: string) => {
    try {
      setAcceptingRequest(requestId);
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });

      if (response.ok) {
        // Redirigir al chat automáticamente
        window.location.href = `/chat/${otherUserId}`;
      } else {
        const result = await response.json();
        alert(result.error || "Error al aceptar la solicitud");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setAcceptingRequest(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "REJECTED" }),
      });

      const result = await response.json();

      if (response.ok) {
        loadRequests();
        alert("Solicitud rechazada exitosamente");
      } else {
        alert(result.error || "Error al rechazar la solicitud");
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  const openChat = (otherUserId: string) => {
    window.location.href = `/chat/${otherUserId}`;
  };

  if (!session) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              No has iniciado sesión
            </h1>
            <p className="text-gray-600 mt-2">
              Por favor inicia sesión para ver tus solicitudes
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Mis Solicitudes
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona tus solicitudes de colaboración recibidas y enviadas
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm p-1 mb-6 inline-flex">
            {[
              { id: "all" as const, label: "Todas" },
              { id: "received" as const, label: "Recibidas" },
              { id: "sent" as const, label: "Enviadas" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Lista de Requests */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Cargando solicitudes...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {activeTab === "received"
                    ? "No tienes solicitudes recibidas"
                    : activeTab === "sent"
                    ? "No has enviado solicitudes"
                    : "No hay solicitudes"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === "received"
                    ? "Las solicitudes que recibas aparecerán aquí."
                    : activeTab === "sent"
                    ? "Las solicitudes que envíes aparecerán aquí."
                    : "Comienza a conectar con otros usuarios enviando solicitudes."}
                </p>
                {activeTab !== "sent" && (
                  <Link
                    href="/dashboard"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Explorar Usuarios
                  </Link>
                )}
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-gray-700">
                          {activeTab === "sent"
                            ? request.toUser.name.charAt(0)
                            : request.fromUser.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {activeTab === "sent"
                            ? `Para: ${request.toUser.name}`
                            : `De: ${request.fromUser.name}`}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                          <span>
                            {activeTab === "sent"
                              ? request.toUser.career
                              : request.fromUser.career}
                          </span>
                          <span>•</span>
                          <span>
                            {activeTab === "sent"
                              ? request.toUser.semester
                              : request.fromUser.semester}
                            ° Semestre
                          </span>
                          <span>•</span>
                          <span>
                            ★{" "}
                            {activeTab === "sent"
                              ? request.toUser.rating
                              : request.fromUser.rating || "Nuevo"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          requestTypes[
                            request.type as keyof typeof requestTypes
                          ]?.color || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {requestTypes[request.type as keyof typeof requestTypes]
                          ?.label || request.type}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          requestStatus[
                            request.status as keyof typeof requestStatus
                          ]?.color || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {requestStatus[
                          request.status as keyof typeof requestStatus
                        ]?.label || request.status}
                      </span>
                    </div>
                  </div>

                  {/* Mensaje */}
                  <div className="mb-4">
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {request.message}
                    </p>
                  </div>

                  {/* Información adicional */}
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                    <div className="flex space-x-4">
                      <span>
                        📅{" "}
                        {new Date(request.createdAt).toLocaleDateString(
                          "es-ES"
                        )}
                      </span>
                      {request._count.messages > 0 && (
                        <span>💬 {request._count.messages} mensajes</span>
                      )}
                    </div>
                  </div>

                  {/* Acciones - ACTUALIZADO */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex space-x-3">
                      {/* QUITADO: "Ver Detalles" */}
                      {request.status === "ACCEPTED" && (
                        <button
                          onClick={() =>
                            openChat(
                              activeTab === "sent"
                                ? request.toUser.id
                                : request.fromUser.id
                            )
                          }
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          💬 Continuar Chat
                        </button>
                      )}
                    </div>

                    {activeTab === "received" &&
                      request.status === "PENDING" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleReject(request.id)}
                            className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-medium"
                          >
                            Rechazar
                          </button>
                          <button
                            onClick={() =>
                              handleAccept(request.id, request.fromUser.id)
                            }
                            disabled={acceptingRequest === request.id}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium disabled:bg-green-400 disabled:cursor-not-allowed"
                          >
                            {acceptingRequest === request.id
                              ? "Aceptando..."
                              : "Aceptar y Chatear"}
                          </button>
                        </div>
                      )}

                    {/* Para requests enviados que fueron aceptados */}
                    {activeTab === "sent" && request.status === "ACCEPTED" && (
                      <button
                        onClick={() => openChat(request.toUser.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        💬 Iniciar Chat
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
