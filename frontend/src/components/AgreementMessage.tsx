interface AgreementMessageProps {
  type: "AGREEMENT_PROPOSAL" | "AGREEMENT_ACCEPTED" | "AGREEMENT_REJECTED";
  senderName: string;
  currentUserName: string;
  requestId: string;
  agreementAcceptedBy?: string[];
  currentUserId: string;
  onAction: (action: "accept" | "reject") => void;
  onRate: () => void;
}

export default function AgreementMessage({
  type,
  senderName,
  currentUserName,
  requestId,
  agreementAcceptedBy = [],
  currentUserId,
  onAction,
  onRate,
}: AgreementMessageProps) {
  const hasCurrentUserAccepted = agreementAcceptedBy.includes(currentUserId);
  const bothAccepted = agreementAcceptedBy.length === 2;

  if (type === "AGREEMENT_PROPOSAL") {
    return (
      <div className="flex justify-center mb-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-md w-full">
          <div className="text-center">
            <div className="text-2xl mb-2">🤝</div>
            <h3 className="font-semibold text-yellow-800 mb-2">
              Propuesta de Acuerdo
            </h3>
            <p className="text-yellow-700 text-sm mb-3">
              <strong>{senderName}</strong> quiere cerrar el acuerdo contigo
            </p>

            {!hasCurrentUserAccepted ? (
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={() => onAction("reject")}
                  className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => onAction("accept")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  Aceptar Acuerdo
                </button>
              </div>
            ) : (
              <p className="text-green-600 text-sm">
                ✅ Ya aceptaste este acuerdo
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === "AGREEMENT_ACCEPTED") {
    return (
      <div className="flex justify-center mb-4">
        <div
          className={`rounded-xl p-4 max-w-md w-full ${
            bothAccepted
              ? "bg-green-50 border border-green-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">{bothAccepted ? "🎉" : "👍"}</div>
            <p
              className={`text-sm mb-3 ${
                bothAccepted ? "text-green-700" : "text-blue-700"
              }`}
            >
              {bothAccepted
                ? `¡Acuerdo completado! ${agreementAcceptedBy
                    .map((_, i) => (i === 0 ? senderName : currentUserName))
                    .join(" y ")} han cerrado el acuerdo`
                : `${senderName} ha aceptado el acuerdo`}
            </p>

            {bothAccepted && (
              <button
                onClick={onRate}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
              >
                ⭐ Calificar Experiencia
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === "AGREEMENT_REJECTED") {
    return (
      <div className="flex justify-center mb-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md w-full">
          <div className="text-center">
            <div className="text-2xl mb-2">❌</div>
            <p className="text-red-700 text-sm">
              <strong>{senderName}</strong> ha rechazado el acuerdo
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
