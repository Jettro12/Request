import Header from "@/components/Header";
import Link from "next/link";

// Datos de ejemplo mejorados
const mockUser = {
  name: "Ana García",
  email: "ana.garcia@universidad.edu",
  career: "Ingeniería en Sistemas",
  semester: 6,
  bio: "Apasionada por el desarrollo web y la inteligencia artificial. También me encanta el arte digital y la fotografía. Busco colaborar en proyectos que combinen tecnología y creatividad.",
  skills: ["React", "Python", "Machine Learning", "Node.js", "MongoDB"],
  interests: [
    "Arte Digital",
    "Fotografía",
    "Inteligencia Artificial",
    "Diseño UX/UI",
    "Realidad Virtual",
  ],
  rating: 4.8,
  reviewCount: 12,
  avatar: "/api/placeholder/150/150",
  socialLinks: {
    github: "https://github.com/anagarcia",
    linkedin: "https://linkedin.com/in/anagarcia",
    portfolio: "https://anagarcia.dev",
    behance: "https://behance.net/anagarcia",
  },
  projects: [
    {
      id: 1,
      title: "Sistema de Detección de Emociones",
      description:
        "Programa que detecta emociones mediante análisis de texto usando Python y NLTK.",
      status: "En progreso",
      media: [
        {
          type: "image",
          url: "/api/placeholder/400/300",
          alt: "Interfaz del sistema",
        },
        {
          type: "image",
          url: "/api/placeholder/400/300",
          alt: "Diagrama de arquitectura",
        },
      ],
      links: {
        github: "https://github.com/anagarcia/emotion-detection",
        demo: "https://emotion-demo.vercel.app",
      },
    },
    {
      id: 2,
      title: "Galería de Arte Digital con React",
      description:
        "Plataforma web para exhibir arte digital con filtros inteligentes y sistema de comentarios.",
      status: "Completado",
      media: [
        {
          type: "image",
          url: "/api/placeholder/400/300",
          alt: "Galería principal",
        },
        {
          type: "video",
          url: "/api/placeholder/400/300",
          alt: "Demo de la aplicación",
        },
      ],
      links: {
        github: "https://github.com/anagarcia/digital-gallery",
        live: "https://digital-gallery.art",
      },
    },
    {
      id: 3,
      title: "Performance: Tecnología y Danza",
      description:
        "Colaboración interdisciplinaria combinando sensores IoT con expresión corporal.",
      status: "En planeación",
      media: [
        {
          type: "video",
          url: "/api/placeholder/400/300",
          alt: "Ensayo performance",
        },
        {
          type: "image",
          url: "/api/placeholder/400/300",
          alt: "Diagrama técnico",
        },
      ],
    },
  ],
};

export default function Profile() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header del Perfil */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar y Info Básica */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-2xl font-bold text-blue-600">
                      {mockUser.name.charAt(0)}
                    </span>
                  </div>
                  <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700">
                    <span className="text-xs">📷</span>
                  </button>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {mockUser.name}
                  </h1>
                  <p className="text-gray-600">
                    {mockUser.career} - {mockUser.semester}° Semestre
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center space-x-1">
                      {"★"
                        .repeat(5)
                        .split("")
                        .map((star, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.floor(mockUser.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            {star}
                          </span>
                        ))}
                    </div>
                    <span className="text-gray-600">
                      ({mockUser.reviewCount} evaluaciones)
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-wrap gap-3 ml-auto">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
                  Editar Perfil
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium">
                  Compartir Perfil
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Columna Izquierda - Información */}
            <div className="md:col-span-2 space-y-6">
              {/* Bio */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Sobre Mí
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {mockUser.bio}
                </p>

                {/* Enlaces Sociales */}
                <div className="flex flex-wrap gap-3">
                  {mockUser.socialLinks.github && (
                    <a
                      href={mockUser.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <span>💻</span>
                      <span className="font-medium">GitHub</span>
                    </a>
                  )}
                  {mockUser.socialLinks.linkedin && (
                    <a
                      href={mockUser.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <span>💼</span>
                      <span className="font-medium">LinkedIn</span>
                    </a>
                  )}
                  {mockUser.socialLinks.portfolio && (
                    <a
                      href={mockUser.socialLinks.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <span>🌐</span>
                      <span className="font-medium">Portafolio</span>
                    </a>
                  )}
                  {mockUser.socialLinks.behance && (
                    <a
                      href={mockUser.socialLinks.behance}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <span>🎨</span>
                      <span className="font-medium">Behance</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Habilidades */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Habilidades Técnicas
                </h2>
                <div className="flex flex-wrap gap-3">
                  {mockUser.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Intereses */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Intereses y Pasiones
                </h2>
                <div className="flex flex-wrap gap-3">
                  {mockUser.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm mt-3">
                  Estos intereses ayudan a conectar con personas de otras
                  disciplinas y encontrar colaboraciones interdisciplinarias.
                </p>
              </div>

              {/* Proyectos Mejorados */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Mis Proyectos
                  </h2>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    + Nuevo Proyecto
                  </button>
                </div>
                <div className="space-y-6">
                  {mockUser.projects.map((project) => (
                    <div
                      key={project.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {project.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {project.description}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === "Completado"
                              ? "bg-green-100 text-green-800"
                              : project.status === "En progreso"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>

                      {/* Media Gallery */}
                      {project.media && project.media.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Galería del proyecto:
                          </h4>
                          <div className="flex space-x-2 overflow-x-auto pb-2">
                            {project.media.map((media, index) => (
                              <div key={index} className="flex-shrink-0">
                                <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                  {media.type === "image" ? (
                                    <span className="text-gray-500">
                                      🖼️ Imagen
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">
                                      🎥 Video
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-center">
                                  {media.alt}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enlaces del Proyecto */}
                      {project.links && (
                        <div className="mb-3">
                          <div className="flex space-x-3">
                            {project.links.github && (
                              <a
                                href={project.links.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                              >
                                <span>💻</span>
                                <span>GitHub</span>
                              </a>
                            )}
                            {project.links.demo && (
                              <a
                                href={project.links.demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
                              >
                                <span>🚀</span>
                                <span>Demo</span>
                              </a>
                            )}
                            {project.links.live && (
                              <a
                                href={project.links.live}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1"
                              >
                                <span>🌐</span>
                                <span>Sitio Web</span>
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-3 pt-3 border-t border-gray-200">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Ver Detalles
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                          Editar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna Derecha - Stats y Acciones Rápidas */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Estadísticas
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Proyectos Completados</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Colaboraciones</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Requests Recibidos</span>
                    <span className="font-semibold">15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Intereses Compartidos</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Miembro desde</span>
                    <span className="font-semibold">Ene 2024</span>
                  </div>
                </div>
              </div>

              {/* Request Button */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  ¿Interesado en colaborar?
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Envía una solicitud a {mockUser.name} para proponerle un
                  proyecto o colaboración.
                </p>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">
                  📨 Enviar Request
                </button>
              </div>

              {/* Contacto */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Contacto
                </h2>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">{mockUser.email}</p>
                  <p className="text-blue-600 font-medium">
                    Disponible para colaboraciones
                  </p>
                  <p className="text-gray-500 text-xs">
                    Especialmente interesada en proyectos que combinen
                    tecnología y arte.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
