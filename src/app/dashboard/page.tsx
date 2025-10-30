"use client";

import Header from "@/components/Header";
import { useState } from "react";
import { useSession } from "next-auth/react";

// Datos de ejemplo - luego vendrán de la base de datos
const mockPosts = [
  {
    id: 1,
    type: "project",
    title: "Desarrollador Frontend para App de Salud Mental",
    content:
      "Busco un desarrollador React para un proyecto de app móvil que ayude a estudiantes con salud mental. El proyecto usa TypeScript y Firebase.",
    author: {
      name: "Carlos Rodríguez",
      career: "Psicología",
      semester: 7,
      rating: 4.5,
    },
    careerSpace: "Psicología",
    createdAt: "2024-01-15",
    skills: ["React", "TypeScript", "Firebase"],
    collaborators: 1,
    needed: 2,
  },
  {
    id: 2,
    type: "job",
    title: "Práctica Profesional en Desarrollo Web",
    content:
      "Empresa de tecnología busca practicantes para desarrollo frontend. Requisitos: HTML, CSS, JavaScript, React. Pago: $800/mes.",
    author: {
      name: "Tech Solutions Inc.",
      career: "Empresa",
      rating: 4.8,
    },
    careerSpace: "Ingeniería en Sistemas",
    createdAt: "2024-01-14",
    skills: ["HTML", "CSS", "JavaScript", "React"],
    deadline: "2024-02-01",
  },
  {
    id: 3,
    type: "collaboration",
    title: "Colaboración en Investigación: Machine Learning",
    content:
      "Busco estudiantes de sistemas o matemáticas para colaborar en investigación sobre modelos predictivos para diagnóstico médico.",
    author: {
      name: "Dra. María González",
      career: "Investigadora",
      rating: 4.9,
    },
    careerSpace: "Ingeniería en Sistemas",
    createdAt: "2024-01-13",
    skills: ["Python", "Machine Learning", "Investigación"],
    duration: "3 meses",
  },
];

// Perfiles de ejemplo por carrera
const mockProfiles = [
  {
    id: 1,
    name: "Ana García",
    career: "Ingeniería en Sistemas",
    semester: 6,
    rating: 4.8,
    skills: ["React", "Python", "AI"],
    interests: ["Arte Digital", "Fotografía"],
    avatar: "/api/placeholder/80/80",
  },
  {
    id: 2,
    name: "Miguel Torres",
    career: "Psicología",
    semester: 5,
    rating: 4.6,
    skills: ["Terapia Cognitiva", "Investigación"],
    interests: ["Tecnología", "Neurociencia"],
    avatar: "/api/placeholder/80/80",
  },
  {
    id: 3,
    name: "Laura Chen",
    career: "Ingeniería en Sistemas",
    semester: 8,
    rating: 4.9,
    skills: ["Machine Learning", "Data Science"],
    interests: ["Música", "Emprendimiento"],
    avatar: "/api/placeholder/80/80",
  },
  {
    id: 4,
    name: "David Martínez",
    career: "Diseño Gráfico",
    semester: 4,
    rating: 4.7,
    skills: ["UI/UX", "Illustrator", "Figma"],
    interests: ["Arte Digital", "Animación"],
    avatar: "/api/placeholder/80/80",
  },
];

const careerSpaces = [
  "Todos los espacios",
  "Ingeniería en Sistemas",
  "Psicología",
  "Administración",
  "Medicina",
  "Derecho",
  "Diseño Gráfico",
  "Artes",
];

const postTypes = {
  project: { label: "Proyecto", color: "bg-blue-100 text-blue-800" },
  job: { label: "Empleo", color: "bg-green-100 text-green-800" },
  collaboration: {
    label: "Colaboración",
    color: "bg-purple-100 text-purple-800",
  },
  entrepreneurship: {
    label: "Emprendimiento",
    color: "bg-orange-100 text-orange-800",
  },
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [selectedCareer, setSelectedCareer] = useState("Todos los espacios");
  const [activeTab, setActiveTab] = useState("all");
  const [view, setView] = useState("posts");

  const filteredPosts = mockPosts.filter(
    (post) =>
      selectedCareer === "Todos los espacios" ||
      post.careerSpace === selectedCareer
  );

  const filteredProfiles = mockProfiles.filter(
    (profile) =>
      selectedCareer === "Todos los espacios" ||
      profile.career === selectedCareer
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header del Dashboard actualizado */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hola, {session?.user?.name} 👋
            </h1>
            <p className="text-gray-600">
              Descubre oportunidades y conecta con tu comunidad universitaria
            </p>
            <div className="mt-2 text-sm text-gray-500">
              {session?.user?.career} • {session?.user?.semester}° Semestre
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Filtros */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                {/* Selector de Vista */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Ver</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setView("posts")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        view === "posts"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Publicaciones
                    </button>
                    <button
                      onClick={() => setView("people")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        view === "people"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Personas
                    </button>
                  </div>
                </div>

                {/* Filtro por Carrera */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Espacios de Carrera
                  </h3>
                  <div className="space-y-2">
                    {careerSpaces.map((career) => (
                      <button
                        key={career}
                        onClick={() => setSelectedCareer(career)}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                          selectedCareer === career
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {career}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtro por Tipo (solo en vista de publicaciones) */}
                {view === "posts" && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Tipo de Publicación
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveTab("all")}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                          activeTab === "all"
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Todas las publicaciones
                      </button>
                      {Object.entries(postTypes).map(
                        ([key, { label, color }]) => (
                          <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                              activeTab === key
                                ? "bg-blue-100 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {label}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Botón Nueva Publicación */}
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">
                  + Nueva Publicación
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Stats Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600">📊</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Publicaciones activas
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {filteredPosts.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-purple-600">👥</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {view === "posts"
                          ? "Personas en este espacio"
                          : "Oportunidades activas"}
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {view === "posts"
                          ? filteredProfiles.length
                          : filteredPosts.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vista de Publicaciones */}
              {view === "posts" && (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Header de la Publicación */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-gray-700">
                              {post.author.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {post.author.name}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>{post.author.career}</span>
                              {post.author.semester && (
                                <span>• {post.author.semester}° Semestre</span>
                              )}
                              <span>• ★ {post.author.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              postTypes[post.type as keyof typeof postTypes]
                                .color
                            }`}
                          >
                            {
                              postTypes[post.type as keyof typeof postTypes]
                                .label
                            }
                          </span>
                          <span className="text-sm text-gray-500">
                            {post.careerSpace}
                          </span>
                        </div>
                      </div>

                      {/* Contenido */}
                      <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          {post.title}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                          {post.content}
                        </p>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Información Específica */}
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                        <div className="flex space-x-4">
                          {post.collaborators && (
                            <span>
                              👥 {post.collaborators}/{post.needed}{" "}
                              colaboradores
                            </span>
                          )}
                          {post.deadline && (
                            <span>📅 Cierra: {post.deadline}</span>
                          )}
                          {post.duration && <span>⏱️ {post.duration}</span>}
                        </div>
                        <span className="text-gray-500">{post.createdAt}</span>
                      </div>

                      {/* Acciones */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div className="flex space-x-3">
                          <button className="text-gray-600 hover:text-blue-600 text-sm font-medium flex items-center space-x-1">
                            <span>💬</span>
                            <span>Comentar</span>
                          </button>
                          <button className="text-gray-600 hover:text-green-600 text-sm font-medium flex items-center space-x-1">
                            <span>🔔</span>
                            <span>Guardar</span>
                          </button>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm">
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Load More */}
                  <div className="text-center mt-8">
                    <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium">
                      Cargar más publicaciones
                    </button>
                  </div>
                </div>
              )}

              {/* Vista de Personas */}
              {view === "people" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Personas en{" "}
                      {selectedCareer === "Todos los espacios"
                        ? "todas las carreras"
                        : selectedCareer}
                    </h2>
                    <p className="text-gray-600">
                      Conecta con estudiantes y profesionales de tu comunidad
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Avatar */}
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-bold text-blue-600">
                              {profile.name.charAt(0)}
                            </span>
                          </div>

                          {/* Información */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {profile.name}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {profile.career} • {profile.semester}°
                                  Semestre
                                </p>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-yellow-400">★</span>
                                <span className="text-sm font-medium text-gray-700">
                                  {profile.rating}
                                </span>
                              </div>
                            </div>

                            {/* Habilidades */}
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1 mb-2">
                                {profile.skills
                                  .slice(0, 3)
                                  .map((skill, index) => (
                                    <span
                                      key={index}
                                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                {profile.skills.length > 3 && (
                                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                    +{profile.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Intereses */}
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-1">
                                {profile.interests
                                  .slice(0, 2)
                                  .map((interest, index) => (
                                    <span
                                      key={index}
                                      className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium"
                                    >
                                      {interest}
                                    </span>
                                  ))}
                              </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex space-x-3">
                              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm flex-1">
                                Ver Perfil
                              </button>
                              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm">
                                📨 Request
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More para personas */}
                  <div className="text-center mt-8">
                    <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium">
                      Ver más personas
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
