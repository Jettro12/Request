"use client";

export default function TestRatings() {
  const testRating = async () => {
    // Necesitas un requestId real de tu base de datos que esté en estado "ACCEPTED"
    const testRequestId = "TU_REQUEST_ID_ACEPTADO_AQUI"; // 👈 REEMPLAZA ESTO

    try {
      const response = await fetch(`/api/requests/${testRequestId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: 5,
          review: "Excelente colaboración, muy recomendado!",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("✅ ÉXITO:", result);
        alert("Rating enviado exitosamente: " + result.message);
      } else {
        console.log("❌ ERROR:", result);
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.log("❌ ERROR DE CONEXIÓN:", error);
      alert("Error de conexión");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Prueba de Sistema de Ratings</h1>
      <button
        onClick={testRating}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Probar Rating
      </button>
      <p style={{ marginTop: "10px", color: "#666" }}>
        Asegúrate de tener un request en estado "ACCEPTED" y reemplazar el ID en
        el código.
      </p>
    </div>
  );
}
