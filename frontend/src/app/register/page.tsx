"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { ApiClient } from "../../lib/api/client";

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
    const data = {
      name: formData.get("firstName") + " " + formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      career: formData.get("career"),
      semester: parseInt(formData.get("semester") as string),
      bio: formData.get("bio") || "",
      skills: [],
      interests: [],
    };

    try {
      // 1. Registrar el usuario usando el microservicio de Auth
      const registerResult = await ApiClient.auth.register({
        email: data.email as string,
        password: data.password as string,
        name: data.name as string,
      });

      // CORRECCIÓN 1: Verificamos success Y que exista la data
      if (!registerResult.success || !registerResult.data) {
        throw new Error(registerResult.error || "Error en el registro");
      }

      // 2. Crear perfil en el microservicio de Users
      // CORRECCIÓN 2: Accedemos a .data.userId
      const profileResult = await ApiClient.users.createProfile({
        userId: registerResult.data.userId,
        name: data.name as string,
        email: data.email as string,
        career: data.career as string,
        semester: data.semester,
        bio: data.bio as string,
        skills: [],
        interests: [],
      });

      if (!profileResult.success) {
        throw new Error("Error al crear el perfil");
      }

      // 3. Iniciar sesión automáticamente después del registro
      const loginResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        throw new Error("Error al iniciar sesión después del registro");
      }

      // 4. Redirigir al dashboard
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nombre
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Juan"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Apellido
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correo Universitario
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                placeholder="tu.correo@universidad.edu"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label
                htmlFor="career"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Carrera
              </label>
              <select
                id="career"
                name="career"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
              >
                <option value="">Selecciona tu carrera</option>
                {careers.map((career) => (
                  <option key={career} value={career}>
                    {career}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="semester"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Semestre
              </label>
              <select
                id="semester"
                name="semester"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
              >
                <option value="">Selecciona tu semestre</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}° Semestre
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Biografía (Opcional)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Cuéntanos sobre ti, tus intereses, proyectos..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
