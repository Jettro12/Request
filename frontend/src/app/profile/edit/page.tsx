'use client';

import Header from '@/components/Header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api/client';

export default function EditProfile() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [formData, setFormData] = useState({
    bio: '',
    skills: [] as string[],
    interests: [] as string[],
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user?.id) return;

      try {
        const result: any = await ApiClient.users.getUserProfile(session.user.id);
        const profile = result?.data?.profile || result?.profile || result;

        if (profile) {
          setFormData({
            bio: profile.bio || '',
            skills: Array.isArray(profile.skills) ? profile.skills : [],
            interests: Array.isArray(profile.interests) ? profile.interests : [],
          });

          if (profile.image) setAvatarPreview(profile.image);
          if (profile.coverImage) setCoverPreview(profile.coverImage);
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadUserData();
  }, [session?.user?.id]);

  const uploadFile = async (
  file: File,
  type: 'avatar' | 'cover' | 'document',
): Promise<string> => {
  if (!session?.user?.id) {
    throw new Error('No hay sesión activa');
  }

  const uploadedFile = await ApiClient.files.uploadFile(
    file,
    session.user.id,
    type,
  );

  if (!uploadedFile?.url) {
    console.error('Archivo inválido:', uploadedFile);
    throw new Error('Error subiendo archivo');
  }

  return uploadedFile.url;
};


  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError('');

    try {
      const url = await uploadFile(file, 'avatar');
      setAvatarPreview(url);

      await ApiClient.users.updateProfile(session!.user.id, { image: url });
      await update({ ...session, user: { ...session!.user, image: url } });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error subiendo avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setError('');

    try {
      const url = await uploadFile(file, 'cover');
      setCoverPreview(url);

      await ApiClient.users.updateProfile(session!.user.id, {
        coverImage: url,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error subiendo portada');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  setSuccess('');

  try {
    await ApiClient.users.updateProfile(session!.user.id, {
      ...formData,
      image: avatarPreview,
      coverImage: coverPreview,
    });

    setSuccess('¡Perfil actualizado con éxito!');
    await update();
    setTimeout(() => router.push('/profile'), 1000);
  } catch (err: any) {
    console.error(err);
    setError(err.message || 'Error al guardar cambios');
  } finally {
    setIsLoading(false);
  }
};

  if (isLoadingData) {
    return <div className="p-20 text-center font-bold">Cargando...</div>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 border">
            <h1 className="text-2xl font-black mb-6">Editar mi Perfil</h1>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="font-bold text-sm">Foto de perfil</label>
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
                {uploadingAvatar && <p>Subiendo avatar...</p>}
                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    className="w-24 h-24 rounded-full mt-2"
                  />
                )}
              </div>

              <div>
                <label className="font-bold text-sm">Portada</label>
                <input type="file" accept="image/*" onChange={handleCoverChange} />
                {uploadingCover && <p>Subiendo portada...</p>}
                {coverPreview && (
                  <img
                    src={coverPreview}
                    className="w-full h-32 object-cover mt-2"
                  />
                )}
              </div>

              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full p-3 border rounded"
                placeholder="Biografía"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
              >
                {isLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
