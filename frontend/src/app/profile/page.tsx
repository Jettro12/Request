'use client';

import Header from '@/components/Header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '../../lib/api/client';
import Link from 'next/link';

// Servicio de archivos (debes crearlo)
import { FilesClient } from '@/lib/api/filesClient';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setIsLoading(true);
      const result = (await ApiClient.users.getUserProfile(
        session.user.id,
      )) as any;

      const data =
        result?.data?.profile || result?.data || result?.profile || result;

      console.log('Perfil cargado:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  // Cargar archivos del usuario
  const fetchUserFiles = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setLoadingFiles(true);
      // Aquí llamarías a tu servicio de archivos
      // const files = await FilesClient.getUserFiles(session.user.id);
      // setUserFiles(files);
    } catch (error) {
      console.error('Error cargando archivos:', error);
    } finally {
      setLoadingFiles(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchProfile();
    fetchUserFiles();
  }, [fetchProfile, fetchUserFiles]);

  if (isLoading)
    return <div className="p-20 text-center font-bold">Cargando perfil...</div>;

  const safeProfile = profile || {};

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Header del perfil con cover y avatar */}
        <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
          {/* Cover image - puedes agregarla si guardas en perfil */}
          {safeProfile.coverImage && (
            <img
              src={safeProfile.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}

          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div className="relative">
              <div className="w-40 h-40 bg-blue-600 rounded-full flex items-center justify-center text-white text-6xl font-black border-8 border-white shadow-2xl">
                {safeProfile.image ? (
                  <img
                    src={safeProfile.image}
                    alt={safeProfile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  safeProfile.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>

              <Link
                href="/profile/edit"
                className="absolute bottom-2 right-2 bg-gray-900 text-white p-3 rounded-full hover:bg-gray-800 transition shadow-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-24 pb-10">
          {/* Información del usuario */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase mb-4">
              {safeProfile.name || session?.user?.name || 'Usuario'}
            </h1>

            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-wider">
                {safeProfile.career || 'Carrera no definida'}
              </span>
              <span className="bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-wider">
                {safeProfile.semester
                  ? `${safeProfile.semester}° Semestre`
                  : 'Semestre N/A'}
              </span>
            </div>

            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {safeProfile.bio || 'Sin biografía disponible.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda - Habilidades e Intereses */}
            <div className="space-y-8">
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                  Habilidades Técnicas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {safeProfile.skills?.length > 0 ? (
                    safeProfile.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm italic">
                      No se han añadido habilidades.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                  Intereses Personales
                </h3>
                <div className="flex flex-wrap gap-2">
                  {safeProfile.interests?.length > 0 ? (
                    safeProfile.interests.map((interest: string) => (
                      <span
                        key={interest}
                        className="bg-purple-50 text-purple-600 px-4 py-2 rounded-xl text-sm font-bold"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm italic">
                      No se han añadido intereses.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Columna central - Galería multimedia */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-gray-900">
                    🖼️ Mi Galería Multimedia
                  </h3>
                  <Link
                    href="/profile/edit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Subir Contenido
                  </Link>
                </div>

                {/* Galería */}
                {loadingFiles ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : userFiles.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {userFiles.map((file) => (
                      <div
                        key={file.id}
                        className="relative group rounded-2xl overflow-hidden bg-gray-100 aspect-square"
                      >
                        {file.type === 'video' ? (
                          <video
                            src={file.url}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <img
                            src={file.url}
                            alt={file.filename}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        )}

                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold">
                            Ver
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-500 mb-4">
                      Aún no has subido contenido multimedia
                    </p>
                    <Link
                      href="/profile/edit"
                      className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition"
                    >
                      Subir mis primeros archivos
                    </Link>
                  </div>
                )}

                {/* Información de cuenta */}
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                    Detalles de la Cuenta
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-sm font-bold text-gray-500">
                        Email
                      </span>
                      <span className="text-sm font-black text-gray-900 truncate">
                        {safeProfile.email || session?.user?.email || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-sm font-bold text-gray-500">
                        Miembro desde
                      </span>
                      <span className="text-sm font-black text-gray-900">
                        {safeProfile.createdAt
                          ? new Date(safeProfile.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-sm font-bold text-gray-500">
                        Archivos subidos
                      </span>
                      <span className="text-sm font-black text-gray-900">
                        {userFiles.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-sm font-bold text-gray-500">
                        Última actualización
                      </span>
                      <span className="text-sm font-black text-gray-900">
                        {safeProfile.updatedAt
                          ? new Date(safeProfile.updatedAt).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
