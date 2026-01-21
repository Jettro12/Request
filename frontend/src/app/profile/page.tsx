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

  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setIsLoading(true);
      const result = (await ApiClient.users.getUserProfile(
        session.user.id,
      )) as any;

      // INTENTA DIFERENTES ESTRUCTURAS
      const data =
        result?.data?.profile || // Primera opción
        result?.data || // Segunda opción
        result?.profile || // Tercera opción
        result; // Última opción

      console.log('Perfil cargado:', data); // Para debug
      setProfile(data);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Actualizar el perfil cuando la sesión cambie
  useEffect(() => {
    if (session?.user) {
      // Si hay nuevos datos en la sesión después de editar
      fetchProfile();
    }
  }, [session, fetchProfile]);

  if (isLoading)
    return <div className="p-20 text-center font-bold">Cargando perfil...</div>;

  // Agregar valores por defecto seguros
  const safeProfile = profile || {};

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-3xl mx-auto px-4">
          {/* Tarjeta Principal de Usuario */}
          <div className="bg-white rounded-[2.5rem] shadow-sm p-10 border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-black">
                {safeProfile.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">
                  {safeProfile.name || session?.user?.name || 'Usuario'}
                </h1>

                {/* Visualización de Carrera y Semestre */}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                  <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                    {safeProfile.career || 'Carrera no definida'}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                    {safeProfile.semester
                      ? `${safeProfile.semester}° Semestre`
                      : 'Semestre N/A'}
                  </span>
                </div>

                <p className="text-gray-500 font-medium max-w-md">
                  {safeProfile.bio || 'Sin biografía disponible.'}
                </p>
              </div>

              <Link
                href="/profile/edit"
                className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition shadow-xl shadow-gray-200"
              >
                Editar Perfil
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Habilidades */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                Habilidades Técnicas
              </h3>
              <div className="flex flex-wrap gap-2">
                {safeProfile.skills?.length > 0 ? (
                  safeProfile.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold"
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

            {/* Intereses */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                Intereses Personales
              </h3>
              <div className="flex flex-wrap gap-2">
                {safeProfile.interests?.length > 0 ? (
                  safeProfile.interests.map((interest: string) => (
                    <span
                      key={interest}
                      className="bg-purple-50 text-purple-600 px-4 py-2 rounded-xl text-xs font-bold"
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

          {/* Información de Cuenta */}
          <div className="mt-6 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              Detalles de la Cuenta
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm font-bold text-gray-500">Email</span>
                <span className="text-sm font-black text-gray-900">
                  {safeProfile.email || session?.user?.email || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-bold text-gray-500">
                  Miembro desde
                </span>
                <span className="text-sm font-black text-gray-900">
                  {safeProfile.createdAt
                    ? new Date(safeProfile.createdAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
