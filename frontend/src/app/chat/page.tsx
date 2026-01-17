"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ApiClient } from "../../lib/api/client";

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
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);
        // Ahora el método getUserConversations ya existe en el cliente
        const result = await ApiClient.chat.getUserConversations(
          session.user.id,
        );

        if (result.success && result.data) {
          setConversations(result.data.conversations || []);
        } else {
          setError(result.error || "Error al cargar conversaciones");
        }
      } catch (err: any) {
        console.error("Error cargando conversaciones:", err);
        setError(err.message || "Error al cargar conversaciones");
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [session]);

  if (!session) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-xl shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">
              Acceso restringido
            </h1>
            <p className="text-gray-600 mt-2">
              Por favor inicia sesión para ver tus mensajes
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
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mensajes</h1>
            <p className="text-gray-600">
              Conecta con otros estudiantes de la comunidad
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900">
                No hay mensajes aún
              </h3>
              <p className="text-gray-500 mt-2 mb-6">
                Busca compañeros para empezar a colaborar
              </p>
              <Link
                href="/dashboard"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explorar Personas
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
              {conversations.map((conv) => (
                <Link
                  key={conv.otherUser.id}
                  href={`/chat/${conv.otherUser.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="p-5 flex items-center space-x-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                      {conv.otherUser.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-gray-900 truncate">
                          {conv.otherUser.name}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {new Date(
                            conv.lastMessage.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 font-medium mb-1">
                        {conv.otherUser.career}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage.senderId === session.user.id
                          ? "Tú: "
                          : ""}
                        {conv.lastMessage.content}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        {conv.unreadCount}
                      </div>
                    )}
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
