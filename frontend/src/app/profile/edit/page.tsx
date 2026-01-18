"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ApiClient } from "../../../lib/api/client";

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

      // Enviamos solo los campos permitidos para edición
      const result = (await ApiClient.users.updateProfile(
        session.user.id,
        formData,
      )) as any;

      if (!result.success) throw new Error(result.error || "Fallo al guardar");

      setSuccess("¡Perfil actualizado con éxito!");

      // Sincronizar y redirigir
      await update();
      setTimeout(() => {
        window.location.href = "/profile";
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor");
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
        <div className="p-20 text-center font-black text-blue-600 animate-pulse uppercase">
          Cargando datos...
        </div>
      </>
    );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-[2.5rem] shadow-xl p-10 border border-gray-100">
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">
                Completar Perfil
              </h1>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">
                Bio • Habilidades • Intereses
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-5 rounded-2xl mb-8 font-bold border border-red-100 animate-shake">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-5 rounded-2xl mb-8 font-bold border border-green-100">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              <div>
                <label className="block text-[11px] font-black uppercase text-gray-400 mb-3 tracking-widest">
                  Sobre ti (Biografía)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Escribe algo sobre tus metas académicas o proyectos..."
                  className="w-full px-6 py-4 rounded-3xl border-2 border-gray-100 text-gray-900 font-bold focus:border-blue-600 focus:ring-0 outline-none h-40 transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-400 mb-5 tracking-widest text-center md:text-left">
                    Habilidades Técnicas
                  </label>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {skillsOptions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleToggle("skills", s)}
                        className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase transition-all transform active:scale-90 ${formData.skills.includes(s) ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-400 mb-5 tracking-widest text-center md:text-left">
                    Intereses
                  </label>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {interestsOptions.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleToggle("interests", i)}
                        className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase transition-all transform active:scale-90 ${formData.interests.includes(i) ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 pt-10">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Guardando..." : "Actualizar mi perfil"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/profile")}
                  className="px-10 bg-white text-gray-400 font-black uppercase text-[10px] rounded-3xl border-2 border-gray-100 hover:bg-gray-50 transition-all"
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
