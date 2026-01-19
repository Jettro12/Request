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
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showAgreementOptions, setShowAgreementOptions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadChatData = async () => {
      if (!otherUserId || !session?.user?.id) return;
      try {
        setIsLoading(true);

        // 1. Cargar Mensajes
        const messagesResult = (await ApiClient.chat.getConversationMessages(
          session.user.id,
          otherUserId,
        )) as any;

        const msgData =
          messagesResult.data?.messages ||
          messagesResult.messages ||
          (Array.isArray(messagesResult) ? messagesResult : []);
        setMessages(msgData);

        // 2. Cargar Perfil
        const userResult = (await ApiClient.users.getUserProfile(
          otherUserId,
        )) as any;
        const userData =
          userResult.data?.user ||
          userResult.user ||
          (userResult.id ? userResult : null);
        if (userData) setOtherUser(userData);

        // 3. Obtener solicitud
        const requestResult = (await ApiClient.requests.getByChat(
          otherUserId,
          session.user.id,
        )) as any;
        const reqData =
          requestResult.data?.request || requestResult.request || null;
        if (reqData) setRequestInfo(reqData);
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

    try {
      setIsSending(true);
      const result = (await ApiClient.chat.sendMessage({
        senderId: session.user.id,
        receiverId: otherUserId,
        content: newMessage,
      })) as any;

      if (result.success) {
        const messagesResult = (await ApiClient.chat.getConversationMessages(
          session.user.id,
          otherUserId,
        )) as any;
        const msgData =
          messagesResult.data?.messages ||
          messagesResult.messages ||
          (Array.isArray(messagesResult) ? messagesResult : []);
        setMessages(msgData);
        setNewMessage("");
      }
    } catch (err: any) {
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
        );
      }

      if (result && result.success) {
        window.location.reload();
      }
    } catch (err: any) {
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
              </div>
            </div>
            {requestInfo?.status === "ACCEPTED" && (
              <button
                onClick={() => setShowAgreementOptions(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
              >
                🤝 Finalizar Ayuda
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
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
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t">
            <div className="flex space-x-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe un mensaje..."
                className="flex-1 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold disabled:bg-gray-300 transition-colors"
              >
                {isSending ? "..." : "Enviar"}
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
