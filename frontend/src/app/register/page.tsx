"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { ApiClient } from "../../lib/api/client"; // Asegúrate de que la ruta sea correcta

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const careers = [
    "Ingeniería en Sistemas",
    "Psicología",
    "Administración",
    "Medicina",
    "Derecho",
    "Diseño Gráfico",
    "Arquitectura",
    "Contabilidad",
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    // Preparamos TODOS los datos para enviarlos al Auth Service
    const registerData = {
      name:
        (formData.get("firstName") as string) +
        " " +
        (formData.get("lastName") as string),
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      career: formData.get("career") as string,
      semester: parseInt(formData.get("semester") as string),
      bio: (formData.get("bio") as string) || "",
      skills: [],
      interests: [],
    };

    try {
      // 1. Registrar TODO de una vez en Auth Service
      // (Nota: Si TypeScript se queja de que 'career' no existe en register,
      // ignóralo por ahora o actualiza tu client.ts, el backend ya lo soporta).
      const registerResult = (await ApiClient.auth.register(
        registerData as any,
      )) as any;

      if (!registerResult.success) {
        throw new Error(registerResult.error || "Error en el registro");
      }

      // 2. Iniciar sesión automáticamente
      const loginResult = await signIn("credentials", {
        email: registerData.email,
        password: registerData.password,
        redirect: false,
      });

      if (loginResult?.error) {
        throw new Error("Error al iniciar sesión después del registro");
      }

      // 3. Redirigir al dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Crear Cuenta</h1>
            <p className="text-gray-600 mt-2">
              Únete a la comunidad universitaria
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... (EL RESTO DEL FORMULARIO ES IGUAL, NO CAMBIA NADA VISUAL) ... */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Universitario
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="tu.correo@universidad.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carrera
              </label>
              <select
                name="career"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Selecciona tu carrera</option>
                {careers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semestre
              </label>
              <select
                name="semester"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}° Semestre
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografía (Opcional)
              </label>
              <textarea
                name="bio"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Cuéntanos sobre ti..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
