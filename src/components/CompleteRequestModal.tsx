"use client";

import { useState } from "react";

interface CompleteRequestModalProps {
  requestId: string;
  otherUserName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompleteRequestModal({
  requestId,
  otherUserName,
  onClose,
  onSuccess,
}: CompleteRequestModalProps) {
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

      const response = await fetch(`/api/requests/${requestId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          review: review.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
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
          {/* Calificación con Estrellas */}
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
            <p className="text-sm text-gray-500 mt-1">
              {rating === 0 && "Selecciona de 1 a 5 estrellas"}
              {rating === 1 && "Muy mala experiencia"}
              {rating === 2 && "Mala experiencia"}
              {rating === 3 && "Experiencia regular"}
              {rating === 4 && "Buena experiencia"}
              {rating === 5 && "Excelente experiencia"}
            </p>
          </div>

          {/* Comentario Opcional */}
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

          {/* Información */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              💡 <strong>Nota:</strong> El acuerdo se marcará como completado
              cuando ambas partes se califiquen.
            </p>
          </div>

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
