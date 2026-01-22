// frontend/lib/api/filesClient.ts
export class FilesClient {
  private static BASE_URL = 'http://localhost:4010/files';

  static async uploadFile(
    file: File,
    userId: string,
    type: 'avatar' | 'cover' | 'post_image' | 'post_video' | 'document',
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('type', type);

    const token = localStorage.getItem('token') || '';

    const response = await fetch(`${this.BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error uploading file');
    }

    return response.json();
  }

  static async getUserFiles(userId: string, type?: string): Promise<any> {
    const token = localStorage.getItem('token') || '';
    const url = type
      ? `${this.BASE_URL}/user/${userId}?type=${type}`
      : `${this.BASE_URL}/user/${userId}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    return response.json();
  }

  static async deleteFile(fileId: string): Promise<void> {
    const token = localStorage.getItem('token') || '';

    const response = await fetch(`${this.BASE_URL}/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
  }
}
