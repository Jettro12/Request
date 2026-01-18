"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ApiClient } from "../../../lib/api/client";

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
const skillsOptions = [
  "React",
  "JavaScript",
  "TypeScript",
  "Python",
  "Node.js",
  "HTML",
  "CSS",
  "Machine Learning",
  "Diseño UX/UI",
  "Figma",
  "Illustrator",
  "Photoshop",
  "Investigación",
  "Análisis de Datos",
  "Estadística",
  "Comunicación",
];
const interestsOptions = [
  "Tecnología",
  "Arte Digital",
  "Fotografía",
  "Música",
  "Deportes",
  "Ciencia",
  "Literatura",
  "Emprendimiento",
  "Medio Ambiente",
  "Voluntariado",
  "Viajes",
  "Gastronomía",
];

export default function EditProfile() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    career: "",
    semester: 1,
    bio: "",
    skills: [] as string[],
    interests: [] as string[],
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user?.id) return;

      try {
        const result = (await ApiClient.users.getUserProfile(
          session.user.id,
        )) as any;
        const user =
          result.data?.user || result.user || (result.id ? result : null);

        if (user) {
          setFormData({
            name: user.name || "",
            email: user.email || "",
            career: user.career || "",
            semester: user.semester || 1,
            bio: user.bio || "",
            skills: Array.isArray(user.skills) ? user.skills : [],
            interests: Array.isArray(user.interests) ? user.interests : [],
          });
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadUserData();
  }, [session?.user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!session?.user?.id) throw new Error("Sesión no válida");

      const result = (await ApiClient.users.updateProfile(
        session.user.id,
        formData,
      )) as any;

      if (!result.success) throw new Error(result.error || "Fallo al guardar");

      setSuccess("¡Perfil guardado! Redirigiendo...");

      // 🚀 SOLUCIÓN AL GUARDADO: Forzamos la actualización de la sesión
      // y usamos window.location para limpiar caches de microservicios
      await update();
      setTimeout(() => {
        window.location.href = "/profile";
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Error al actualizar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (list: "skills" | "interests", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [list]: prev[list].includes(value)
        ? prev[list].filter((item) => item !== value)
        : [...prev[list], value],
    }));
  };

  if (isLoadingData)
    return (
      <>
        <Header />
        <div className="p-20 text-center font-black animate-pulse">
          CARGANDO PERFIL...
        </div>
      </>
    );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">
              Editar Perfil
            </h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-8">
              Base de Datos Centralizada
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 font-bold border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-4 rounded-2xl mb-6 font-bold border border-green-100">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-gray-900 font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">
                    Carrera / Facultad
                  </label>
                  <select
                    value={formData.career}
                    onChange={(e) =>
                      setFormData({ ...formData, career: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-gray-900 font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="">Seleccionar...</option>
                    {careers.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">
                  Biografía Profesional
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-gray-900 font-bold focus:ring-2 focus:ring-blue-600 outline-none h-32"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-4">
                  Habilidades Técnicas
                </label>
                <div className="flex flex-wrap gap-2">
                  {skillsOptions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleToggle("skills", s)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.skills.includes(s) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                  {isLoading ? "Sincronizando..." : "Guardar Cambios"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-8 bg-gray-50 text-gray-400 font-black uppercase text-xs rounded-2xl border border-gray-100"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
