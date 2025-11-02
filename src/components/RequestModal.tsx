"use client";

import { useState } from "react";

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
  const [requestType, setRequestType] = useState("COLLABORATION");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Por favor escribe un mensaje");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: requestType,
          message: message.trim(),
          toUserId: receiverId,
        }),
      });

      if (response.ok) {
        // Mostrar mensaje de éxito y cerrar modal
        alert(
          "¡Request enviado! Espera a que el usuario lo acepte para comenzar a chatear."
        );
        onSuccess();
      } else {
        const result = await response.json();
        setError(result.error || "Error al enviar el request");
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
            Enviar Request a {receiverName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
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
                  className={`p-3 border rounded-lg text-sm font-medium text-center transition-colors ${
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Botones */}
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
              disabled={isSubmitting || !message.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enviando..." : "Enviar Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
