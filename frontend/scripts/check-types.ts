// frontend/scripts/check-types.ts
import type { Session, User } from "next-auth";

// Esta función solo verifica que los tipos sean correctos
function typeCheck() {
  const user: User = {
    id: "123",
    email: "test@test.com",
    name: "Test User",
    // Campos opcionales
    career: "Ingeniería",
    semester: 5,
    skills: ["JavaScript", "TypeScript"],
    // Debería funcionar sin errores
  };
  
  const session: Session = {
    user: user,
    expires: "2024-12-31T23:59:59.999Z",
  };
  
  console.log("✅ Tipos compilados correctamente");
  console.log("Usuario:", user);
  console.log("Sesión:", session);
}

typeCheck();