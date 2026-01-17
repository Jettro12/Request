"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
// IMPORTANTE: Importamos Request y ApiClient desde el mismo lugar
import { ApiClient, Request } from "../../lib/api/client";

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
    "all",
  );

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [acceptingRequest, setAcceptingRequest] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [activeTab, session?.user?.id]);

  const loadRequests = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const result = await ApiClient.requests.getUserRequests(
        session.user.id,
        activeTab,
      );

      if (result.success && result.data) {
        setRequests(result.data.requests || []);
      } else {
        setRequests([]);
        if (!result.success)
          setError(result.error || "Error al cargar las solicitudes");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (requestId: string, otherUserId: string) => {
    try {
      setAcceptingRequest(requestId);
      const result = await ApiClient.requests.updateRequestStatus(
        requestId,
        "ACCEPTED",
      );

      if (result.success) {
        window.location.href = `/chat/${otherUserId}`;
      } else {
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
      const result = await ApiClient.requests.updateRequestStatus(
        requestId,
        "REJECTED",
      );

      if (result.success) {
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

  const openCompleteModal = (request: Request) => {
    setSelectedRequest(request);
    setShowCompleteModal(true);
  };

  const handleCompleteSuccess = () => {
    setShowCompleteModal(false);
    setSelectedRequest(null);
    loadRequests();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${
              star <= Math.round(rating || 0)
                ? "text-yellow-400"
                : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (!session) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Acceso restringido
            </h1>
            <p className="text-gray-600 mt-2">
              Inicia sesión para ver tus solicitudes
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Mis Solicitudes
            </h1>
            <p className="text-gray-600 mt-2">Gestiona tus colaboraciones</p>
          </div>

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
            <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                No hay solicitudes para mostrar.
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center shrink-0 font-bold text-gray-700">
                        {(activeTab === "sent"
                          ? request.toUser.name
                          : request.fromUser.name
                        ).charAt(0)}
                      </div>
                      <div className="flex-1">
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
                          <div className="flex items-center space-x-1">
                            {renderStars(
                              activeTab === "sent"
                                ? (request.toUser.rating ?? 0)
                                : (request.fromUser.rating ?? 0),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${requestTypes[request.type as keyof typeof requestTypes]?.color}`}
                      >
                        {requestTypes[request.type as keyof typeof requestTypes]
                          ?.label || request.type}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${requestStatus[request.status as keyof typeof requestStatus]?.color}`}
                      >
                        {requestStatus[
                          request.status as keyof typeof requestStatus
                        ]?.label || request.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mb-4">
                    {request.message}
                  </p>

                  <div className="flex justify-between items-center text-sm text-gray-600 mb-4 pt-4 border-t border-gray-100">
                    <div className="flex space-x-4">
                      <span>
                        📅{" "}
                        {new Date(request.createdAt).toLocaleDateString(
                          "es-ES",
                        )}
                      </span>
                      {/* ✅ CORRECCIÓN FINAL: Optional Chaining para evitar error de compilación */}
                      {(request._count?.messages ?? 0) > 0 && (
                        <span>💬 {request._count?.messages} mensajes</span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {activeTab === "received" &&
                        request.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="text-red-600 px-4 py-2 border rounded-lg hover:bg-red-50"
                            >
                              Rechazar
                            </button>
                            <button
                              onClick={() =>
                                handleAccept(request.id, request.fromUser.id)
                              }
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                              Aceptar
                            </button>
                          </>
                        )}
                      {(request.status === "ACCEPTED" ||
                        request.status === "COMPLETED") && (
                        <button
                          onClick={() =>
                            openChat(
                              activeTab === "sent"
                                ? request.toUser.id
                                : request.fromUser.id,
                            )
                          }
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Ir al Chat
                        </button>
                      )}
                      {request.status === "ACCEPTED" && (
                        <button
                          onClick={() => openCompleteModal(request)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          ✅ Completar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {showCompleteModal && selectedRequest && (
          <CompleteRequestModal
            requestId={selectedRequest.id}
            otherUserName={
              activeTab === "sent"
                ? selectedRequest.toUser.name
                : selectedRequest.fromUser.name
            }
            onClose={() => setShowCompleteModal(false)}
            onSuccess={handleCompleteSuccess}
          />
        )}
      </main>
    </>
  );
}

// Sub-componente Modal
function CompleteRequestModal({
  requestId,
  otherUserName,
  onClose,
  onSuccess,
}: {
  requestId: string;
  otherUserName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Selecciona una calificación");
      return;
    }
    try {
      setIsSubmitting(true);
      const result = await ApiClient.requests.completeRequest(requestId, {
        rating,
        review: review.trim(),
      });
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Error");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Calificar a {otherUserName}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2 justify-center py-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className="text-3xl"
              >
                {s <= rating ? "⭐" : "☆"}
              </button>
            ))}
          </div>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Comentario..."
            className="w-full border p-2 rounded"
            rows={3}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border p-2 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 bg-green-600 text-white p-2 rounded"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
