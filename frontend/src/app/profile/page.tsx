'use client';

import Header from '@/components/Header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '../../lib/api/client';
import Link from 'next/link';

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

      // Adaptación a diferentes formatos de respuesta del microservicio
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

  const fetchUserFiles = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setLoadingFiles(true);
      // Aquí puedes implementar la carga de archivos si tu endpoint está listo
      // const res = await ApiClient.files.getUserFiles(session.user.id);
      // setUserFiles(res.data || []);
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-bold text-blue-600 animate-pulse">
        Cargando perfil...
      </div>
    );

  const safeProfile = profile || {};

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pb-20">
        {/* Banner simplificado (Solo color sólido o degradado sin imagen) */}
        <div className="h-48 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-inner" />

        <div className="max-w-6xl mx-auto px-4">
          {/* Header del perfil (Avatar flotando sobre el banner) */}
          <div className="relative -mt-24 flex flex-col items-center">
            <div className="relative group">
              <div className="w-44 h-44 bg-white rounded-full flex items-center justify-center text-white text-6xl font-black border-[6px] border-white shadow-xl overflow-hidden">
                {safeProfile.image ? (
                  <img
                    src={safeProfile.image}
                    alt={safeProfile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Si la imagen falla por CORS o 404, mostramos la inicial
                        (e.target as any).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-blue-600">
                    {safeProfile.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>

              <Link
                href="/profile/edit"
                className="absolute bottom-2 right-2 bg-gray-900 text-white p-3 rounded-full hover:bg-blue-600 transition-all shadow-lg hover:scale-110 active:scale-95"
                title="Editar perfil"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Link>
            </div>

            {/* Información principal */}
            <div className="text-center mt-6">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
                {safeProfile.name || session?.user?.name || 'Usuario'}
              </h1>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <span className="bg-blue-100 text-blue-700 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-blue-200">
                  {safeProfile.career || 'Carrera no definida'}
                </span>
                <span className="bg-gray-100 text-gray-700 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-gray-200">
                  {safeProfile.semester ? `${safeProfile.semester}° Semestre` : 'Semestre N/A'}
                </span>
              </div>
              <p className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                {safeProfile.bio || '¡Hola! Soy estudiante y estoy usando Request para colaborar.'}
              </p>
            </div>
          </div>

          {/* Grid de Contenido */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
            
            {/* Sidebar: Skills e Intereses */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6">
                  Habilidades Técnicas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {safeProfile.skills?.length > 0 ? (
                    safeProfile.skills.map((skill: string) => (
                      <span key={skill} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold border border-blue-100">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm italic">No se han añadido habilidades.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-6">
                  Intereses
                </h3>
                <div className="flex flex-wrap gap-2">
                  {safeProfile.interests?.length > 0 ? (
                    safeProfile.interests.map((interest: string) => (
                      <span key={interest} className="bg-purple-50 text-purple-600 px-4 py-2 rounded-xl text-xs font-bold border border-purple-100">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm italic">No se han añadido intereses.</p>
                  )}
                </div>
              </div>

              {/* Stats Rápidas */}
              <div className="bg-gray-900 rounded-3xl p-8 text-white">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
                  Actividad
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold opacity-60">Archivos</span>
                    <span className="text-xl font-black">{userFiles.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold opacity-60">Rating</span>
                    <span className="text-xl font-black">⭐ {safeProfile.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Principal: Galería Multimedia */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm min-h-[400px]">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    Multimedia <span className="text-blue-600">.</span>
                  </h3>
                  <Link
                    href="/profile/edit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                  >
                    + Subir
                  </Link>
                </div>

                {loadingFiles ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  </div>
                ) : userFiles.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {userFiles.map((file) => (
                      <div key={file.id} className="relative group rounded-3xl overflow-hidden bg-gray-50 aspect-square border shadow-sm">
                        {file.type === 'video' ? (
                          <video src={file.url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={file.url} alt="User Upload" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button className="bg-white text-gray-900 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest">
                            Ver
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-300 text-3xl">
                      📸
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
                      Tu galería está vacía
                    </p>
                    <Link href="/profile/edit" className="text-blue-600 text-xs font-black uppercase mt-4 block hover:underline">
                      Añadir contenido ahora →
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}