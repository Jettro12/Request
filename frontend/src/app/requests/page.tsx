"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
// IMPORTANTE: Importamos Request y ApiClient desde el mismo lugar
import { ApiClient, Request } from "../../lib/api/client";

// BORRA LA INTERFAZ 'Request' LOCAL PARA USAR LA IMPORTADA

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

  // Estados existentes
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "received" | "sent">(
    "all"
  );

  // === CORRECCIÓN 1: AGREGAR ESTADOS FALTANTES ===
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
        activeTab
      );

      // === CORRECCIÓN 2: ACCEDER A LA DATA CORRECTAMENTE ===
      if (result.success && result.data) {
        setRequests(result.data.requests || []);
      } else {
        setRequests([]); // Limpiar si falla o no hay data
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
      setAcceptingRequest(requestId); // Usamos el estado de carga para el botón
      const result = await ApiClient.requests.updateRequestStatus(
        requestId,
        "ACCEPTED"
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
        "REJECTED"
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

  // Estas funciones ahora funcionarán porque definimos los estados arriba
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Mis Solicitudes
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona tus solicitudes de colaboración recibidas y enviadas
            </p>
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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

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
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-semibold text-gray-700">
                          {activeTab === "sent"
                            ? request.toUser.name.charAt(0)
                            : request.fromUser.name.charAt(0)}
                        </span>
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
                          <span>
                            {activeTab === "sent"
                              ? request.toUser.semester
                              : request.fromUser.semester}
                            ° Semestre
                          </span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            {renderStars(
                              activeTab === "sent"
                                ? request.toUser.rating || 0
                                : request.fromUser.rating || 0
                            )}
                            <span className="font-medium">
                              {activeTab === "sent"
                                ? request.toUser.rating
                                  ? request.toUser.rating.toFixed(1)
                                  : "Nuevo"
                                : request.fromUser.rating
                                ? request.fromUser.rating.toFixed(1)
                                : "Nuevo"}
                            </span>
                          </div>
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

                  <div className="mb-4">
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {request.message}
                    </p>
                  </div>

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

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
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

                    {(request.status === "ACCEPTED" ||
                      request.status === "COMPLETED") && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const otherUserId =
                              activeTab === "sent"
                                ? request.toUser.id
                                : request.fromUser.id;
                            openChat(otherUserId);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center space-x-2"
                        >
                          <span>💬</span>
                          <span>Ir al Chat</span>
                        </button>

                        {/* Botón para completar acuerdo si está aceptado */}
                        {request.status === "ACCEPTED" && (
                          <button
                            onClick={() => openCompleteModal(request)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium flex items-center space-x-2"
                          >
                            <span>✅</span>
                            <span>Completar</span>
                          </button>
                        )}
                      </div>
                    )}

                    {activeTab === "sent" && request.status === "PENDING" && (
                      <div className="text-sm text-gray-500">
                        Esperando respuesta...
                      </div>
                    )}

                    {request.status === "REJECTED" && (
                      <div className="text-sm text-red-500 font-medium">
                        Solicitud rechazada
                      </div>
                    )}

                    {request.status === "COMPLETED" && (
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-green-600 font-medium">
                          ✅ Acuerdo completado
                        </span>
                      </div>
                    )}
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

// Componente Modal para Cerrar Acuerdo
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
      setError("Por favor selecciona una calificación");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      // === CORRECCIÓN 3: USAR APICLIENT EN LUGAR DE FETCH MANUAL ===
      const result = await ApiClient.requests.completeRequest(requestId, {
        rating,
        review: review.trim(),
      });

      if (result.success) {
        alert("Acuerdo completado exitosamente");
        onSuccess();
      } else {
        setError(result.error || "Error al completar el acuerdo");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Cerrar Acuerdo con {otherUserName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Califica a {otherUserName}
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl focus:outline-none"
                >
                  {star <= rating ? "⭐" : "☆"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="review"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Comentario (opcional)
            </label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={`Comparte tu experiencia trabajando con ${otherUserName}...`}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enviando..." : "Enviar Calificación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
