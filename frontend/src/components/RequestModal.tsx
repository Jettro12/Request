"use client";

import { useState } from "react";
import { ApiClient, User } from "../lib/api/client";
import { useSession } from "next-auth/react";

interface RequestModalProps {
  receiverId: string;
  receiverName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const requestTypes = [
  { value: "COLLABORATION", label: "Colaboración", emoji: "🤝" },
  { value: "ADVICE", label: "Consejo", emoji: "💡" },
  { value: "JOB_OFFER", label: "Oferta de Trabajo", emoji: "💼" },
  { value: "MENTORSHIP", label: "Mentoría", emoji: "🎓" },
];

export default function RequestModal({
  receiverId,
  receiverName,
  onClose,
  onSuccess,
}: RequestModalProps) {
  const { data: session } = useSession();
  const [requestType, setRequestType] = useState("COLLABORATION");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      setError("Debes iniciar sesión para enviar una solicitud");
      return;
    }

    if (!message.trim()) {
      setError("Por favor escribe un mensaje");
      return;
    }

    if (session.user.id === receiverId) {
      setError("No puedes enviarte una solicitud a ti mismo");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      // Usar microservicio de Requests
      const result = (await ApiClient.requests.createRequest({
        type: requestType,
        message: message.trim(),
        fromUserId: session.user.id,
        toUserId: receiverId,
      })) as any;

      if (result.success) {
        // Mostrar mensaje de éxito
        alert(
          "¡Request enviado! Espera a que el usuario lo acepte para comenzar a chatear.",
        );

        // Cerrar modal y ejecutar callback de éxito
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Error al enviar el request");
      }
    } catch (err: any) {
      console.error("Error enviando request:", err);
      setError(err.message || "Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Enviar Request a {receiverName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Request */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Request
            </label>
            <div className="grid grid-cols-2 gap-2">
              {requestTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setRequestType(type.value)}
                  disabled={isSubmitting}
                  className={`p-3 border rounded-lg text-sm font-medium text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    requestType === type.value
                      ? "bg-blue-100 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-lg mb-1">{type.emoji}</div>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mensaje */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mensaje (será visible para {receiverName})
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Ej: Hola ${receiverName}, me gustaría colaborar contigo en...`}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Sé específico sobre tu propuesta para aumentar las posibilidades
              de aceptación.
            </p>
          </div>

          {/* Consejos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              💡 <strong>Consejo:</strong> {getTipByType(requestType)}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Información del usuario */}
          <div className="text-sm text-gray-600">
            <p>
              <strong>Destinatario:</strong> {receiverName}
            </p>
            <p>
              <strong>Tu ID de usuario:</strong>{" "}
              {session?.user?.id
                ? `${session.user.id.substring(0, 8)}...`
                : "No disponible"}
            </p>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim() || !session?.user?.id}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Enviando...
                </>
              ) : (
                "Enviar Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Función auxiliar para mostrar consejos según el tipo de request
function getTipByType(type: string): string {
  const tips: Record<string, string> = {
    COLLABORATION:
      "Menciona qué habilidades puedes aportar y qué esperas aprender.",
    ADVICE: "Sé claro sobre el tema específico en el que necesitas consejo.",
    JOB_OFFER:
      "Incluye detalles sobre el rol, responsabilidades y compensación si aplica.",
    MENTORSHIP:
      "Explica qué áreas específicas te gustaría desarrollar con la mentoría.",
  };

  return (
    tips[type] ||
    "Sé claro y específico en tu mensaje para obtener mejores resultados."
  );
}
