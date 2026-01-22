"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiClient } from "../../lib/api/client";

const postTypes = [
  {
    value: "project",
    label: "🚀 Proyecto",
    description: "Busco colaboradores para un proyecto",
  },
  {
    value: "collaboration",
    label: "🤝 Colaboración",
    description: "Busco partner para trabajar juntos",
  },
  {
    value: "job",
    label: "💼 Empleo",
    description: "Oferta de trabajo o práctica profesional",
  },
  {
    value: "entrepreneurship",
    label: "💡 Emprendimiento",
    description: "Idea de negocio buscando cofundadores",
  },
  {
    value: "announcement",
    label: "📢 Anuncio",
    description: "Anuncio o evento relevante",
  },
];

const careerSpaces = [
  "Ingeniería en Sistemas",
  "Psicología",
  "Administración",
  "Medicina",
  "Derecho",
  "Diseño Gráfico",
  "Arquitectura",
  "Contabilidad",
  "Artes",
  "Otra",
];

const commonSkills = [
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
  "Gestión de Proyectos",
  "Liderazgo",
  "Trabajo en Equipo",
  "Creatividad",
];

// CORRECCIÓN: Exportar un componente que maneje /posts
export default function PostsPage() {
  const router = useRouter();

  // Si quieres redirigir a /posts/new automáticamente
  // O mostrar directamente el formulario

  // Opción A: Redirigir a /posts/new
  // useEffect(() => {
  //   router.push('/posts/new');
  // }, [router]);

  // Opción B: Mostrar el formulario directamente en /posts
  return <NewPost />;
}

// Tu componente de creación de posts (renombrado)
function NewPost() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "project",
    careerSpace: session?.user?.career || "",
    skills: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!session?.user?.id) {
        throw new Error("Usuario no autenticado");
      }

      // Usar microservicio de Posts - IMPORTANTE: type debe estar en MAYÚSCULAS
      const result = (await ApiClient.posts.createPost({
        title: formData.title,
        content: formData.content,
        type: formData.type.toUpperCase(), // ← Convertir a mayúsculas
        careerSpace: formData.careerSpace,
        skills: formData.skills,
        authorId: session.user.id,
      })) as any;

      if (!result.success) {
        throw new Error(result.error || "Error al crear la publicación");
      }

      setSuccess("¡Publicación creada exitosamente!");

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
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

  const handleCareerSpaceChange = (career: string) => {
    setFormData((prev) => ({
      ...prev,
      careerSpace: career,
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
              Por favor inicia sesión para crear una publicación
            </p>
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
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Crear Nueva Publicación
              </h1>
              <p className="text-gray-600 mt-2">
                Comparte una oportunidad con la comunidad universitaria
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
              {/* Tipo de Publicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Tipo de Publicación *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {postTypes.map((postType) => (
                    <div
                      key={postType.value}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          type: postType.value,
                        }))
                      }
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        formData.type === postType.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {postType.label}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {postType.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Título */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Título de la Publicación *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Ej: Busco colaborador para proyecto de Machine Learning"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {formData.title.length}/100 caracteres
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Descripción Detallada *
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Describe tu proyecto, qué buscas, qué ofrece, requisitos, etc..."
                />
              </div>

              {/* Espacio de Carrera */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Espacio de Carrera *
                </label>
                <div className="flex flex-wrap gap-2">
                  {careerSpaces.map((career) => (
                    <button
                      key={career}
                      type="button"
                      onClick={() => handleCareerSpaceChange(career)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.careerSpace === career
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {career}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Seleccionado:{" "}
                  <span className="font-medium">{formData.careerSpace}</span>
                </p>
              </div>

              {/* Habilidades Buscadas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Habilidades Buscadas (Opcional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.skills.includes(skill)
                          ? "bg-green-600 text-white"
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
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleSkillToggle(skill)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Vista Previa */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Vista Previa</h3>
                <div className="space-y-3 text-sm">
                  <p>
                    <strong>Tipo:</strong>{" "}
                    {postTypes.find((t) => t.value === formData.type)?.label}
                  </p>
                  <p>
                    <strong>Título:</strong> {formData.title || "(sin título)"}
                  </p>
                  <p>
                    <strong>Carrera:</strong>{" "}
                    {formData.careerSpace || "(no seleccionada)"}
                  </p>
                  {formData.skills.length > 0 && (
                    <p>
                      <strong>Habilidades:</strong> {formData.skills.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creando Publicación..." : "Publicar"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
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
