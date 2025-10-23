import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section - Mantenemos lo que ya funciona */}
        <section className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Conecta con tu{" "}
            <span className="text-blue-600">comunidad universitaria</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Encuentra colaboradores para tus proyectos, oportunidades de empleo
            y conecta con estudiantes de todas las carreras en una sola
            plataforma.
          </p>

          <div className="flex justify-center space-x-4 mb-16">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium">
              Comenzar Ahora
            </button>
            <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 font-medium">
              Ver Demo
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Espacios por Carrera
              </h3>
              <p className="text-gray-600">
                Conecta con estudiantes y profesores de tu facultad y otras
                carreras.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-green-600 text-xl">💼</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Proyectos y Empleo</h3>
              <p className="text-gray-600">
                Encuentra oportunidades de colaboración, prácticas y empleo.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-purple-600 text-xl">⭐</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Sistema de Reputación
              </h3>
              <p className="text-gray-600">
                Califica y sé calificado después de cada colaboración exitosa.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para unirte a la comunidad?
            </h2>
            <p className="text-blue-100 mb-8">
              Regístrate ahora y comienza a conectar con miles de estudiantes y
              profesionales.
            </p>
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 font-medium inline-block"
            >
              Crear Cuenta Gratis
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
