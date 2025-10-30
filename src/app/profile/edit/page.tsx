"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
  const { data: session } = useSession();
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

  // Cargar datos actuales del usuario
  // Cargar datos actuales del usuario desde la API
  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch("/api/profile");
        const result = await response.json();

        if (response.ok && result.user) {
          setFormData({
            name: result.user.name || "",
            email: result.user.email || "",
            career: result.user.career || "",
            semester: result.user.semester || 1,
            bio: result.user.bio || "",
            skills: result.user.skills || [],
            interests: result.user.interests || [],
          });
        }
      } catch (err) {
        console.error("Error cargando datos del usuario:", err);
        // Si falla la API, usar datos de la sesión
        setFormData((prev) => ({
          ...prev,
          name: session.user.name || "",
          email: session.user.email || "",
          career: session.user.career || "",
          semester: session.user.semester || 1,
        }));
      } finally {
        setIsLoadingData(false);
      }
    };

    loadUserData();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar el perfil");
      }

      setSuccess("Perfil actualizado exitosamente");

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  if (!session) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              No has iniciado sesión
            </h1>
            <p className="text-gray-600 mt-2">
              Por favor inicia sesión para editar tu perfil
            </p>
          </div>
        </div>
      </>
    );
  }

  if (isLoadingData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando tu perfil...</p>
          </div>
        </div>
      </>
    );
  }

  if (isLoadingData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando tu perfil...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Editar Perfil
              </h1>
              <p className="text-gray-600 mt-2">
                Actualiza tu información personal y profesional
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información Básica */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="tu.correo@universidad.edu"
                  />
                </div>
              </div>

              {/* Carrera y Semestre */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="career"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Carrera *
                  </label>
                  <select
                    id="career"
                    value={formData.career}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        career: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
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
                    Semestre *
                  </label>
                  <select
                    id="semester"
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        semester: parseInt(e.target.value),
                      }))
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}° Semestre
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Biografía */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Biografía
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Cuéntanos sobre ti, tus intereses, proyectos, metas..."
                />
              </div>

              {/* Habilidades */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Habilidades Técnicas
                </label>
                <div className="flex flex-wrap gap-2">
                  {skillsOptions.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.skills.includes(skill)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Seleccionadas: {formData.skills.length} habilidades
                </p>
              </div>

              {/* Intereses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Intereses y Pasiones
                </label>
                <div className="flex flex-wrap gap-2">
                  {interestsOptions.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.interests.includes(interest)
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Seleccionados: {formData.interests.length} intereses
                </p>
              </div>

              {/* Botones */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Guardando..." : "Guardar Cambios"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/profile")}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium"
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
