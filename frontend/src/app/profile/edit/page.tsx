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
  "Figma",
  "Comunicación",
];
const interestsOptions = [
  "Tecnología",
  "Arte Digital",
  "Música",
  "Deportes",
  "Ciencia",
  "Emprendimiento",
  "Viajes",
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
        const user = result.data?.user || result.user || result;

        if (user) {
          setFormData({
            name: user.name || "",
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
      const result = (await ApiClient.users.updateProfile(
        session!.user.id,
        formData,
      )) as any;
      if (!result.success) throw new Error(result.error || "Fallo al guardar");

      setSuccess("¡Perfil actualizado!");
      await update(); // Actualiza la sesión local

      setTimeout(() => {
        window.location.href = "/profile"; // Recarga total para sincronizar microservicios
      }, 1500);
    } catch (err: any) {
      setError("Error al guardar cambios. Verifica la conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (list: "skills" | "interests", item: string) => {
    setFormData((prev) => ({
      ...prev,
      [list]: prev[list].includes(item)
        ? prev[list].filter((i) => i !== item)
        : [...prev[list], item],
    }));
  };

  if (isLoadingData)
    return (
      <div className="p-20 text-center font-black animate-pulse uppercase">
        Cargando...
      </div>
    );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-[2.5rem] shadow-xl p-10 border border-gray-100 font-sans">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-8">
              Editar Perfil Profesional
            </h1>

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

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 text-gray-900 font-bold focus:border-blue-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">
                    Carrera
                  </label>
                  <select
                    value={formData.career}
                    onChange={(e) =>
                      setFormData({ ...formData, career: e.target.value })
                    }
                    className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 text-gray-900 font-bold focus:border-blue-600 outline-none"
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
                  Biografía
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full px-5 py-3 rounded-2xl border-2 border-gray-50 text-gray-900 font-bold focus:border-blue-600 outline-none h-32"
                  placeholder="Sobre ti..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-4">
                  Habilidades
                </label>
                <div className="flex flex-wrap gap-2">
                  {skillsOptions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleItem("skills", s)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.skills.includes(s) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                  {isLoading ? "Guardando..." : "Confirmar Cambios"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-8 bg-gray-50 text-gray-400 font-black uppercase text-xs rounded-2xl"
                >
                  Volver
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
