'use client';

import Header from '@/components/Header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api/client';

const skillsOptions = [
  'React',
  'JavaScript',
  'Python',
  'Node.js',
  'Diseño UX/UI',
  'Figma',
  'Inglés',
  'Análisis de Datos',
];
const interestsOptions = [
  'Tecnología',
  'Música',
  'Deportes',
  'Ciencia',
  'Emprendimiento',
  'Viajes',
  'Arte',
];

// Carreras disponibles
const careerOptions = [
  'Ingeniería en Sistemas',
  'Psicología',
  'Administración',
  'Medicina',
  'Derecho',
  'Diseño Gráfico',
  'Artes',
  'Ingeniería Civil',
  'Contabilidad',
  'Marketing',
];

export default function EditProfile() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estado para imágenes
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [formData, setFormData] = useState({
    bio: '',
    skills: [] as string[],
    interests: [] as string[],
    career: '',
    semester: 1,
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user?.id) return;
      try {
        const result = (await ApiClient.users.getUserProfile(
          session.user.id,
        )) as any;
        const profile = result.data?.profile || result.profile || result;

        if (profile) {
          setFormData({
            bio: profile.bio || '',
            skills: Array.isArray(profile.skills) ? profile.skills : [],
            interests: Array.isArray(profile.interests)
              ? profile.interests
              : [],
            career: profile.career || '',
            semester: profile.semester || 1,
          });

          // Cargar preview de avatar si existe
          if (profile.image) {
            setAvatarPreview(profile.image);
          }

          // Cargar preview de cover si existe
          if (profile.coverImage) {
            setCoverPreview(profile.coverImage);
          }
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadUserData();
  }, [session?.user?.id]);

  // Función para subir archivos usando el ApiClient
  const uploadFile = async (
    file: File,
    type: 'avatar' | 'cover' | 'post_image' | 'post_video' | 'document',
  ): Promise<string> => {
    try {
      if (!session?.user?.id) {
        throw new Error('No hay sesión activa');
      }

      // Usa el ApiClient.files.uploadFile
      const result = await ApiClient.files.uploadFile(
        file,
        session.user.id,
        type,
      );

      if (result.success && result.data?.file?.url) {
        return result.data.file.url;
      } else {
        throw new Error(result.error || 'Error subiendo archivo');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes (JPEG, PNG, WEBP, GIF)');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    setAvatarFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir automáticamente
    handleUploadAvatar(file);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes (JPEG, PNG, WEBP)');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 10MB');
      return;
    }

    setCoverFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir automáticamente
    handleUploadCover(file);
  };

  const handleUploadAvatar = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const avatarUrl = await uploadFile(file, 'avatar');

      // Actualizar perfil con nueva imagen
      await ApiClient.users.updateProfile(session!.user.id, {
        image: avatarUrl,
      });

      // Actualizar sesión
      await update({
        ...session,
        user: {
          ...session?.user,
          image: avatarUrl,
        },
      });

      alert('¡Avatar actualizado con éxito!');
    } catch (error: any) {
      console.error('Error subiendo avatar:', error);
      alert(error.message || 'Error al subir el avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUploadCover = async (file: File) => {
    setUploadingCover(true);
    try {
      const coverUrl = await uploadFile(file, 'cover');

      // Actualizar perfil con imagen de portada
      await ApiClient.users.updateProfile(session!.user.id, {
        coverImage: coverUrl,
      });

      alert('¡Imagen de portada actualizada con éxito!');
    } catch (error: any) {
      console.error('Error subiendo portada:', error);
      alert(error.message || 'Error al subir la portada');
    } finally {
      setUploadingCover(false);
    }
  };

  // Función para subir múltiples documentos
  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limitar a 5 archivos por vez
    if (files.length > 5) {
      alert('Máximo 5 archivos a la vez');
      return;
    }

    const uploadedFiles: string[] = [];

    for (const file of files) {
      try {
        // Validar tamaño (máximo 50MB)
        if (file.size > 50 * 1024 * 1024) {
          alert(`${file.name} es demasiado grande. Máximo 50MB`);
          continue;
        }

        // Validar tipo
        const allowedExtensions = [
          '.pdf',
          '.doc',
          '.docx',
          '.jpg',
          '.jpeg',
          '.png',
          '.zip',
        ];
        const fileExtension = file.name
          .toLowerCase()
          .slice(file.name.lastIndexOf('.'));

        if (!allowedExtensions.includes(fileExtension)) {
          alert(`${file.name}: Tipo de archivo no permitido`);
          continue;
        }

        // Subir archivo usando ApiClient
        const result = await ApiClient.files.uploadFile(
          file,
          session!.user.id,
          'document',
        );

        if (result.success) {
          uploadedFiles.push(file.name);
          console.log(
            `${file.name} subido correctamente:`,
            result.data?.file?.url,
          );
        } else {
          throw new Error(result.error || 'Error subiendo archivo');
        }
      } catch (error: any) {
        console.error(`Error subiendo ${file.name}:`, error);
        alert(`Error al subir ${file.name}: ${error.message}`);
      }
    }

    if (uploadedFiles.length > 0) {
      alert(`Archivos subidos exitosamente: ${uploadedFiles.join(', ')}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Subir avatar si hay uno nuevo
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        avatarUrl = await uploadFile(avatarFile, 'avatar');
      }

      // 2. Subir cover si hay uno nuevo
      let coverUrl = coverPreview;
      if (coverFile) {
        coverUrl = await uploadFile(coverFile, 'cover');
      }

      // 3. Actualizar perfil con todos los datos
      const updateResult = await ApiClient.users.updateProfile(
        session!.user.id,
        {
          ...formData,
          image: avatarUrl,
          coverImage: coverUrl,
        },
      );

      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Error actualizando perfil');
      }

      setSuccess('¡Perfil actualizado con éxito!');

      // 4. Actualizar sesión
      await update();

      // 5. Redirigir después de 1 segundo
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggle = (field: 'skills' | 'interests', val: string) => {
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
        <div className="max-w-4xl mx-auto px-4">
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

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Sección de Imágenes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Avatar Upload */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Foto de Perfil
                  </label>
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="w-full h-full rounded-full overflow-hidden bg-blue-50 border-4 border-white shadow-lg">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl font-bold text-blue-600">
                            {session?.user?.name?.charAt(0).toUpperCase() ||
                              'U'}
                          </span>
                        </div>
                      )}

                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>

                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
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
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    JPEG, PNG, GIF, WEBP • Máx. 5MB
                  </p>
                  {uploadingAvatar && (
                    <p className="text-xs text-blue-600 text-center">
                      Subiendo avatar...
                    </p>
                  )}
                </div>

                {/* Cover Upload */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Imagen de Portada
                  </label>
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-gray-200">
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <svg
                          className="w-12 h-12 mb-2"
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
                        <p className="text-sm">Agregar portada</p>
                      </div>
                    )}

                    {uploadingCover && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}

                    <label className="absolute bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-800 transition flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                        disabled={uploadingCover}
                      />
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <span className="text-sm font-medium">Subir</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    JPEG, PNG, WEBP • Máx. 10MB
                  </p>
                  {uploadingCover && (
                    <p className="text-xs text-blue-600">Subiendo portada...</p>
                  )}
                </div>
              </div>

              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Carrera
                  </label>
                  <select
                    value={formData.career}
                    onChange={(e) =>
                      setFormData({ ...formData, career: e.target.value })
                    }
                    className="w-full p-4 rounded-2xl border bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Selecciona tu carrera</option>
                    {careerOptions.map((career) => (
                      <option key={career} value={career}>
                        {career}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Semestre
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        semester: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-4 rounded-2xl border bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ej: 5"
                  />
                </div>
              </div>

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
                      onClick={() => toggle('skills', s)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition ${formData.skills.includes(s) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}
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
                      onClick={() => toggle('interests', i)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition ${formData.interests.includes(i) ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}
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
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50 hover:bg-blue-700 transition"
                >
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          {/* Sección para subir documentos/portafolio */}
          <div className="mt-8 bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-6">
              📁 Mi Portafolio / Documentos
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-gray-600 mb-2">
                  Sube proyectos, certificados o documentos que quieras
                  compartir
                </p>
                <label className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-gray-800 transition">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                    className="hidden"
                    onChange={handleDocumentUpload}
                  />
                  📤 Subir Archivos
                </label>
                <p className="text-xs text-gray-500 mt-4">
                  PDF, DOC, DOCX, JPG, PNG, ZIP • Máx. 50MB por archivo • Máx. 5
                  archivos
                </p>
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-bold text-blue-800 mb-2">
                  💡 Recomendaciones:
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Sube tu CV o currículum actualizado</li>
                  <li>• Comparte certificados de cursos realizados</li>
                  <li>• Agrega fotos de proyectos universitarios</li>
                  <li>• Los documentos deben ser apropiados y profesionales</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
