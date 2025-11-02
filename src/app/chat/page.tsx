"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Conversation {
  otherUser: {
    id: string;
    name: string;
    career: string;
    semester: number;
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/conversations");

        if (response.ok) {
          const result = await response.json();
          setConversations(result.conversations);
        } else {
          setError("Error al cargar conversaciones");
        }
      } catch (err) {
        setError("Error de conexión");
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, []);

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
              Por favor inicia sesión para ver el chat
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mensajes</h1>
            <p className="text-gray-600">
              Gestiona tus conversaciones y conecta con la comunidad
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando conversaciones...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aún no tienes conversaciones
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza una conversación con alguien de la comunidad
              </p>
              <Link
                href="/dashboard?view=people"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Explorar Personas
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm">
              {conversations.map((conversation) => (
                <Link
                  key={conversation.lastMessage.id}
                  href={`/chat/${conversation.otherUser.id}`}
                  className="block border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-blue-600">
                          {conversation.otherUser.name.charAt(0)}
                        </span>
                      </div>

                      {/* Información de la conversación */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {conversation.otherUser.name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {new Date(
                              conversation.lastMessage.createdAt
                            ).toLocaleDateString("es-ES")}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-1">
                          {conversation.otherUser.career} •{" "}
                          {conversation.otherUser.semester}° Semestre
                        </p>
                        <p className="text-gray-700 truncate">
                          {conversation.lastMessage.senderId ===
                            session.user.id && (
                            <span className="text-gray-500">Tú: </span>
                          )}
                          {conversation.lastMessage.content}
                        </p>
                      </div>

                      {/* Notificación de mensajes no leídos */}
                      {conversation.unreadCount > 0 && (
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
