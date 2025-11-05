"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import CompleteRequestModal from "@/components/CompleteRequestModal";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  read: boolean;
  type: string;
  sender: {
    id: string;
    name: string;
    career: string;
  };
}

interface User {
  id: string;
  name: string;
  career: string;
  semester: number;
}

interface RequestInfo {
  id: string;
  status: string;
  agreementAcceptedBy?: string[];
}

export default function ChatConversationPage() {
  const { data: session } = useSession();
  const params = useParams();
  const otherUserId = params.userId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [requestInfo, setRequestInfo] = useState<RequestInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showAgreementOptions, setShowAgreementOptions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadChatData = async () => {
      try {
        setIsLoading(true);

        const messagesResponse = await fetch(
          `/api/messages?otherUserId=${otherUserId}`
        );
        if (messagesResponse.ok) {
          const messagesResult = await messagesResponse.json();
          setMessages(messagesResult.messages);
        }

        const userResponse = await fetch(`/api/users/${otherUserId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setOtherUser(userData);
        }

        const requestResponse = await fetch(
          `/api/requests/chat/${otherUserId}`
        );
        if (requestResponse.ok) {
          const requestData = await requestResponse.json();
          setRequestInfo(requestData.request);
        }
      } catch (err) {
        setError("Error al cargar el chat");
      } finally {
        setIsLoading(false);
      }
    };

    if (otherUserId) {
      loadChatData();
    }
  }, [otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          receiverId: otherUserId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessages((prev) => [...prev, result.message]);
        setNewMessage("");
      } else {
        setError("Error al enviar el mensaje");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setIsSending(false);
    }
  };

  const handleAgreementAction = async (
    action: "propose" | "accept" | "reject"
  ) => {
    if (!requestInfo?.id) return;

    try {
      setIsSending(true);
      console.log("🔵 [FRONTEND-AGREEMENT] Enviando acción:", action);

      const response = await fetch(
        `/api/requests/${requestInfo.id}/agreement`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("🔵 [FRONTEND-AGREEMENT] Respuesta:", result);

        const messagesResponse = await fetch(
          `/api/messages?otherUserId=${otherUserId}`
        );
        if (messagesResponse.ok) {
          const messagesResult = await messagesResponse.json();
          setMessages(messagesResult.messages);
        }

        const requestResponse = await fetch(
          `/api/requests/chat/${otherUserId}`
        );
        if (requestResponse.ok) {
          const requestData = await requestResponse.json();
          setRequestInfo(requestData.request);
        }

        setShowAgreementOptions(false);

        if (result.shouldShowRating) {
          console.log("🔵 [FRONTEND] Mostrando modal de calificación");
          setTimeout(() => {
            setShowCompleteModal(true);
          }, 1000);
        }
      } else {
        const errorResult = await response.json();
        setError("Error al procesar la acción");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCompleteSuccess = () => {
    setShowCompleteModal(false);
    fetch(`/api/requests/chat/${otherUserId}`)
      .then((response) => response.json())
      .then((data) => setRequestInfo(data.request));
  };

  const hasAgreementMessages = messages.some(
    (msg) =>
      msg.type === "AGREEMENT_PROPOSAL" ||
      msg.type === "AGREEMENT_ACCEPTED" ||
      msg.type === "AGREEMENT_REJECTED"
  );

  const isRequestCompleted = requestInfo?.status === "COMPLETED";

  if (!session) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              No has iniciado sesión
            </h1>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando conversación...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto h-screen flex flex-col">
          {/* Header del Chat - CON BOTÓN DE CALIFICACIÓN */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-blue-600">
                    {otherUser?.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900 text-lg">
                    {otherUser?.name}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {otherUser?.career} • {otherUser?.semester}° Semestre
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Botón para calificar - Visible cuando ambos aceptaron pero no completaron */}
                {requestInfo?.status === "ACCEPTED" &&
                  hasAgreementMessages &&
                  !isRequestCompleted && (
                    <button
                      onClick={() => setShowCompleteModal(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium text-sm"
                    >
                      ⭐ Calificar
                    </button>
                  )}

                {/* Botón para proponer acuerdo */}
                {requestInfo?.status === "ACCEPTED" &&
                  !isRequestCompleted &&
                  !hasAgreementMessages && (
                    <button
                      onClick={() => setShowAgreementOptions(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-sm"
                    >
                      🤝 Cerrar Acuerdo
                    </button>
                  )}

                {/* Estado del acuerdo */}
                {hasAgreementMessages && (
                  <div className="text-sm text-gray-600">
                    {isRequestCompleted
                      ? "✅ Acuerdo Completado"
                      : "🤝 Ambos aceptaron - Califica ahora"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Comienza la conversación
                </h3>
                <p className="text-gray-600">
                  Envía el primer mensaje a {otherUser?.name}
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.type === "AGREEMENT_PROPOSAL" ||
                    message.type === "AGREEMENT_ACCEPTED" ||
                    message.type === "AGREEMENT_REJECTED" ? (
                      <div className="flex justify-center mb-4">
                        <div
                          className={`rounded-xl p-4 max-w-md w-full ${
                            message.type === "AGREEMENT_PROPOSAL"
                              ? "bg-yellow-50 border border-yellow-200"
                              : message.type === "AGREEMENT_ACCEPTED"
                              ? "bg-green-50 border border-green-200"
                              : "bg-red-50 border border-red-200"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">
                              {message.type === "AGREEMENT_PROPOSAL"
                                ? "🤝"
                                : message.type === "AGREEMENT_ACCEPTED"
                                ? "✅"
                                : "❌"}
                            </div>
                            <p
                              className={`text-sm ${
                                message.type === "AGREEMENT_PROPOSAL"
                                  ? "text-yellow-700"
                                  : message.type === "AGREEMENT_ACCEPTED"
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              {message.content}
                            </p>

                            {message.type === "AGREEMENT_PROPOSAL" &&
                              message.senderId !== session.user?.id && (
                                <div className="flex space-x-2 justify-center mt-3">
                                  <button
                                    onClick={() =>
                                      handleAgreementAction("reject")
                                    }
                                    className="px-3 py-1 border border-red-600 text-red-600 rounded text-sm hover:bg-red-50"
                                  >
                                    Rechazar
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAgreementAction("accept")
                                    }
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                  >
                                    Aceptar
                                  </button>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`flex ${
                          message.senderId === session.user?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            message.senderId === session.user?.id
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === session.user?.id
                                ? "text-blue-200"
                                : "text-gray-500"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString(
                              "es-ES",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Opciones de Acuerdo */}
          {showAgreementOptions && (
            <div className="bg-yellow-50 border border-yellow-200 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-yellow-800 font-medium">
                    🤝 ¿Quieres proponer cerrar el acuerdo?
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Se enviará una propuesta formal a {otherUser?.name} para
                    calificar la experiencia.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAgreementOptions(false)}
                    className="px-3 py-1 border border-gray-400 text-gray-700 rounded text-sm hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleAgreementAction("propose")}
                    disabled={isSending}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {isSending ? "Enviando..." : "Enviar Propuesta"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Input de Mensaje */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSending}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSending ? "Enviando..." : "Enviar"}
              </button>
            </div>
            {error && (
              <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal para Calificar */}
      {showCompleteModal && otherUser && requestInfo && (
        <CompleteRequestModal
          requestId={requestInfo.id}
          otherUserName={otherUser.name}
          onClose={() => setShowCompleteModal(false)}
          onSuccess={handleCompleteSuccess}
        />
      )}
    </>
  );
}
