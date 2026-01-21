// frontend/components/ProfileAvatarUpload.tsx
'use client';

import { useState } from 'react';
import { FilesClient } from '@/lib/api/filesClient';

interface ProfileAvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string;
  onUploadComplete: (url: string) => void;
}

export default function ProfileAvatarUpload({
  userId,
  currentAvatarUrl,
  onUploadComplete,
}: ProfileAvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no permitido. Use JPEG, PNG, WEBP o GIF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      setError('La imagen es demasiado grande. Máximo 5MB.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await FilesClient.uploadFile(
        file,
        userId,
        'avatar',
        (percentage) => setProgress(percentage),
      );

      onUploadComplete(result.file.url);
      alert('¡Avatar actualizado con éxito!');
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-32 h-32 mx-auto">
        {currentAvatarUrl ? (
          <img
            src={currentAvatarUrl}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-4xl font-bold text-blue-600">
              {userId.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-xs">{progress}%</p>
            </div>
          </div>
        )}
      </div>

      <label className="block">
        <span className="sr-only">Cambiar avatar</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </label>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        Formatos: JPG, PNG, WEBP, GIF • Máximo: 5MB
      </p>
    </div>
  );
}
