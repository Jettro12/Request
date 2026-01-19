"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ApiClient } from "@/lib/api/client";

const skillsOptions = [
  "React",
  "JavaScript",
  "Python",
  "Node.js",
  "Diseño UX/UI",
  "Figma",
  "Inglés",
  "Análisis de Datos",
];
const interestsOptions = [
  "Tecnología",
  "Música",
  "Deportes",
  "Ciencia",
  "Emprendimiento",
  "Viajes",
  "Arte",
];

export default function EditProfile() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
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
        // ✅ Corregido: Tu profile-service devuelve { profile: { ... } }
        const profile = result.data?.profile || result.profile;
        if (profile) {
          setFormData({
            bio: profile.bio || "",
            skills: Array.isArray(profile.skills) ? profile.skills : [],
            interests: Array.isArray(profile.interests)
              ? profile.interests
              : [],
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
    try {
      // ✅ Usa la función corregida del cliente (PATCH)
      await ApiClient.users.updateProfile(session!.user.id, formData);
      setSuccess("¡Perfil actualizado con éxito!");
      await update();
      setTimeout(() => {
        window.location.href = "/profile";
      }, 1000);
    } catch (err) {
      setError("Error al guardar.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggle = (field: "skills" | "interests", val: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(val)
        ? prev[field].filter((i) => i !== val)
        : [...prev[field], val],
    }));
  };

  if (isLoadingData)
    return <div className="p-20 text-center font-bold">Cargando...</div>;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
            <h1 className="text-2xl font-black text-gray-900 mb-6 uppercase">
              Editar mi Perfil
            </h1>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 font-bold">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-4 font-bold">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  Biografía
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full p-4 rounded-2xl border bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none h-32"
                  placeholder="Cuéntanos sobre ti..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3">
                  Mis Habilidades
                </label>
                <div className="flex flex-wrap gap-2">
                  {skillsOptions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle("skills", s)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition ${formData.skills.includes(s) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3">
                  Intereses
                </label>
                <div className="flex flex-wrap gap-2">
                  {interestsOptions.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggle("interests", i)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition ${formData.interests.includes(i) ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500"}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50"
                >
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold"
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
