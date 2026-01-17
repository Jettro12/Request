"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import CompleteRequestModal from "@/components/CompleteRequestModal";
import { ApiClient, User } from "../../../lib/api/client";

// Interfaz local para mensajes
interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  read: boolean;
  type: string;
  sender?: {
    id: string;
    name: string;
    career: string;
  };
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
      if (!otherUserId) return;
      try {
        setIsLoading(true);

        // 1. Cargar Mensajes
        const messagesResult =
          await ApiClient.chat.getConversationMessages(otherUserId);
        if (messagesResult.success && messagesResult.data) {
          setMessages(messagesResult.data.messages || []);
        }

        // 2. Cargar Perfil del otro usuario
        const userResult = await ApiClient.users.getUserProfile(otherUserId);
        if (userResult.success && userResult.data) {
          setOtherUser(userResult.data.user);
        }

        // 3. Obtener solicitud (request) vinculada
        const requestResult = await ApiClient.requests.getByChat(otherUserId);
        if (requestResult.success && requestResult.data) {
          setRequestInfo(requestResult.data.request || null);
        }
      } catch (err: any) {
        console.error("Error cargando datos del chat:", err);
        setError("Error al cargar la conversación");
      } finally {
        setIsLoading(false);
      }
    };

    loadChatData();
  }, [otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending || !session?.user?.id) return;

    try {
      setIsSending(true);
      const result = await ApiClient.chat.sendMessage(otherUserId, {
        senderId: session.user.id,
        content: newMessage,
        receiverId: otherUserId,
        type: "TEXT",
      });

      if (result.success) {
        // Recargamos mensajes para ver el nuevo
        const messagesResult =
          await ApiClient.chat.getConversationMessages(otherUserId);
        if (messagesResult.success && messagesResult.data) {
          setMessages(messagesResult.data.messages || []);
        }
        setNewMessage("");
        setError("");
      }
    } catch (err: any) {
      console.error("Error enviando mensaje:", err);
      setError("No se pudo enviar el mensaje");
    } finally {
      setIsSending(false);
    }
  };

  const handleAgreementAction = async (
    action: "propose" | "accept" | "reject",
  ) => {
    if (!requestInfo?.id) return;

    try {
      setIsSending(true);
      let result;

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
        );
      }

      if (result.success) {
        // Refrescar datos
        const msgRes =
          await ApiClient.chat.getConversationMessages(otherUserId);
        if (msgRes.success && msgRes.data)
          setMessages(msgRes.data.messages || []);

        const reqRes = await ApiClient.requests.getByChat(otherUserId);
        if (reqRes.success && reqRes.data)
          setRequestInfo(reqRes.data.request || null);

        setShowAgreementOptions(false);

        // Si el backend indica que ya se puede calificar
        if ((result as any).data?.shouldShowRating) {
          setShowCompleteModal(true);
        }
      }
    } catch (err: any) {
      console.error("Error en acción de acuerdo:", err);
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

  const hasAgreementMessages = messages.some((msg) =>
    ["AGREEMENT_PROPOSAL", "AGREEMENT_ACCEPTED", "AGREEMENT_REJECTED"].includes(
      msg.type,
    ),
  );

  const isRequestCompleted = requestInfo?.status === "COMPLETED";

  if (!session)
    return (
      <>
        <Header />
        <div className="p-10 text-center">Inicia sesión para chatear.</div>
      </>
    );
  if (isLoading)
    return (
      <>
        <Header />
        <div className="p-10 text-center">Cargando...</div>
      </>
    );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto h-[calc(100vh-64px)] flex flex-col">
          {/* Header del Chat */}
          <div className="bg-white border-b p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {otherUser?.name?.charAt(0)}
              </div>
              <div>
                <h1 className="font-bold text-gray-900">{otherUser?.name}</h1>
                <p className="text-xs text-gray-500">{otherUser?.career}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              {requestInfo?.status === "ACCEPTED" &&
                !isRequestCompleted &&
                (!hasAgreementMessages ? (
                  <button
                    onClick={() => setShowAgreementOptions(true)}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                  >
                    🤝 Cerrar Acuerdo
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCompleteModal(true)}
                    className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                  >
                    ⭐ Calificar
                  </button>
                ))}
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === session.user?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl ${
                    msg.senderId === session.user?.id
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-[10px] opacity-70 block mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Opciones de Acuerdo Flotantes */}
          {showAgreementOptions && (
            <div className="bg-yellow-50 border-t border-yellow-200 p-4 flex justify-between items-center">
              <p className="text-sm text-yellow-800">
                ¿Enviar propuesta de finalización?
              </p>
              <div className="space-x-2">
                <button
                  onClick={() => setShowAgreementOptions(false)}
                  className="text-xs text-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleAgreementAction("propose")}
                  className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                >
                  Enviar
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex space-x-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe un mensaje..."
                className="flex-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl disabled:bg-gray-300"
              >
                Enviar
              </button>
            </div>
          </div>
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
