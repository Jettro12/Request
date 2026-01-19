"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import CompleteRequestModal from "@/components/CompleteRequestModal";
import { ApiClient, User } from "../../../lib/api/client";

// Interfaz local blindada
interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  requestId?: string;
  createdAt: string;
}

interface RequestInfo {
  id: string;
  status: string;
}

export default function ChatConversationPage() {
  const { data: session, status: authStatus } = useSession();
  const params = useParams();
  const otherUserId = params.userId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [requestInfo, setRequestInfo] = useState<RequestInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showAgreementOptions, setShowAgreementOptions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Función para cargar mensajes
  const loadMessages = async (requestId?: string) => {
    if (!session?.user?.id || !otherUserId) return [];

    try {
      const messagesResult = (await ApiClient.chat.getConversationMessages(
        session.user.id,
        otherUserId,
      )) as any;

      // El nuevo messages-service devuelve { success, data, count }
      if (messagesResult.success && Array.isArray(messagesResult.data)) {
        return messagesResult.data;
      }
      // Formato anterior (backward compatibility)
      else if (Array.isArray(messagesResult)) {
        return messagesResult;
      }
      // Otros formatos
      else if (messagesResult.data?.messages) {
        return messagesResult.data.messages;
      } else if (messagesResult.messages) {
        return messagesResult.messages;
      }

      return [];
    } catch (err: any) {
      console.warn("Error cargando mensajes:", err);
      return [];
    }
  };

  useEffect(() => {
    const loadChatData = async () => {
      if (!otherUserId || !session?.user?.id) return;
      try {
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        // 1. Obtener solicitud PRIMERO (necesitamos requestId para todo)
        const requestResult = (await ApiClient.requests.getByChat(
          otherUserId,
          session.user.id,
        )) as any;
        const reqData =
          requestResult.data?.request || requestResult.request || null;
        setRequestInfo(reqData);

        // 2. Cargar Mensajes (solo si hay una solicitud)
        if (reqData?.id) {
          const loadedMessages = await loadMessages(reqData.id);
          setMessages(loadedMessages);
        } else {
          setMessages([]); // No hay solicitud, no hay mensajes
        }

        // 3. Cargar Perfil
        const userResult = (await ApiClient.users.getUserProfile(
          otherUserId,
        )) as any;
        const userData =
          userResult.data?.user ||
          userResult.user ||
          (userResult.id ? userResult : null);
        if (userData) setOtherUser(userData);
      } catch (err: any) {
        console.error("Error cargando chat:", err);
        setError("Error al cargar la conversación");
      } finally {
        setIsLoading(false);
      }
    };

    if (authStatus === "authenticated") loadChatData();
  }, [otherUserId, session, authStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending || !session?.user?.id) return;

    // VERIFICACIÓN: Necesitamos requestId para enviar mensajes
    if (!requestInfo?.id) {
      setError(
        "No hay una solicitud activa. No puedes enviar mensajes sin una solicitud.",
      );
      return;
    }

    try {
      setIsSending(true);
      setError("");
      setSuccessMessage("");

      // Enviar mensaje con requestId REQUERIDO
      const result = (await ApiClient.chat.sendMessage({
        senderId: session.user.id,
        receiverId: otherUserId,
        content: newMessage,
        requestId: requestInfo.id,
      })) as any;

      if (result.success) {
        // Mensaje enviado exitosamente
        setSuccessMessage("Mensaje enviado!");

        // Recargar mensajes después de enviar
        const loadedMessages = await loadMessages(requestInfo.id);
        setMessages(loadedMessages);
        setNewMessage("");

        // Limpiar mensaje de éxito después de 2 segundos
        setTimeout(() => setSuccessMessage(""), 2000);
      } else {
        // El API devolvió success: false
        setError(
          result.error || result.message || "Error al enviar el mensaje",
        );
      }
    } catch (err: any) {
      console.error("Error enviando mensaje:", err);

      // Manejar diferentes tipos de errores
      if (err.status === 400) {
        setError(
          "Datos inválidos: " + (err.data?.message || "Verifica la solicitud"),
        );
      } else if (err.status === 404) {
        setError("La solicitud no existe o ha sido eliminada");
      } else {
        setError("No se pudo enviar el mensaje. Intenta nuevamente.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleAgreementAction = async (
    action: "propose" | "accept" | "reject",
  ) => {
    if (!requestInfo?.id || !session?.user?.id) return;

    try {
      setIsSending(true);
      setError("");
      let result: any;

      if (action === "propose") {
        result = await ApiClient.requests.completeRequest(requestInfo.id, {
          rating: 0,
          review: "Propuesta de acuerdo enviada",
          isProposal: true,
        });
      } else if (action === "accept") {
        result = await ApiClient.requests.completeRequest(requestInfo.id, {
          rating: 5,
          review: "Acuerdo aceptado",
        });
      } else {
        result = await ApiClient.requests.updateRequestStatus(
          requestInfo.id,
          "REJECTED",
          session.user.id,
        );
      }

      if (result && result.success) {
        window.location.reload();
      } else {
        setError(result?.error || "Error al procesar el acuerdo");
      }
    } catch (err: any) {
      console.error("Error procesando acuerdo:", err);
      setError("Error al procesar el acuerdo");
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

  // Mostrar mensaje si no hay solicitud
  const noRequestMessage = !requestInfo?.id && !isLoading;

  // Estado de la solicitud para mensajes informativos
  const requestStatus = requestInfo?.status;

  if (authStatus === "loading")
    return (
      <div className="p-10 text-center font-bold">Verificando sesión...</div>
    );
  if (!session)
    return <div className="p-10 text-center">Inicia sesión para chatear.</div>;
  if (isLoading)
    return <div className="p-10 text-center">Cargando conversación...</div>;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto h-[calc(100vh-64px)] flex flex-col">
          <div className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {otherUser?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h1 className="font-bold text-gray-900">
                  {otherUser?.name || "Usuario"}
                </h1>
                <p className="text-xs text-gray-500">{otherUser?.career}</p>
                <div className="flex items-center gap-2 mt-1">
                  {requestInfo?.id && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      Solicitud: {requestStatus}
                    </span>
                  )}
                  {noRequestMessage && (
                    <span className="text-xs text-red-500">
                      ⚠️ No hay solicitud activa
                    </span>
                  )}
                </div>
              </div>
            </div>
            {requestInfo?.status === "ACCEPTED" && (
              <button
                onClick={() => setShowAgreementOptions(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
              >
                🤝 Finalizar Ayuda
              </button>
            )}
          </div>

          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 mx-4 mt-4 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 mx-4 mt-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Mensaje si no hay solicitud */}
          {noRequestMessage && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 m-4 rounded-lg">
              <p className="font-medium">No hay una solicitud activa</p>
              <p className="text-sm mt-1">
                Para enviar mensajes, primero debes crear una solicitud de
                colaboración.
              </p>
              <button
                onClick={() => window.history.back()}
                className="mt-2 text-sm text-yellow-700 hover:text-yellow-900 underline"
              >
                ← Volver para crear una solicitud
              </button>
            </div>
          )}

          {/* Mensaje si la solicitud no está aceptada */}
          {requestInfo?.id &&
            requestInfo.status !== "ACCEPTED" &&
            requestInfo.status !== "PENDING" && (
              <div className="bg-gray-100 border border-gray-300 text-gray-700 p-3 mx-4 mt-4 rounded-lg">
                <p className="font-medium">
                  Solicitud {requestInfo.status.toLowerCase()}
                </p>
                <p className="text-sm mt-1">
                  Esta solicitud ha sido {requestInfo.status.toLowerCase()}.
                  Puedes ver el historial pero no enviar nuevos mensajes.
                </p>
              </div>
            )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === session.user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${msg.senderId === session.user?.id ? "bg-blue-600 text-white rounded-br-none" : "bg-white border text-gray-800 rounded-bl-none"}`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-[10px] opacity-70 block mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : !noRequestMessage && requestInfo?.id ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay mensajes aún. ¡Envía el primero!</p>
                <p className="text-xs mt-1">Solicitud: {requestInfo.status}</p>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          {/* Campo de texto SOLO si hay solicitud y está en estado PENDING o ACCEPTED */}
          {requestInfo?.id &&
            (requestInfo.status === "PENDING" ||
              requestInfo.status === "ACCEPTED") && (
              <div className="p-4 bg-white border-t">
                <div className="flex space-x-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    disabled={isSending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[80px]"
                  >
                    {isSending ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-4 w-4 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        ...
                      </span>
                    ) : (
                      "Enviar"
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Los mensajes están vinculados a la solicitud #
                  {requestInfo.id.substring(0, 8)}...
                </p>
              </div>
            )}
        </div>
      </main>
      {showCompleteModal && requestInfo && otherUser && (
        <CompleteRequestModal
          requestId={requestInfo.id}
          otherUserName={otherUser.name}
          onClose={() => setShowCompleteModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
