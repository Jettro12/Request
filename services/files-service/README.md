# 💾 Files Service

**Servicio de almacenamiento de archivos. Maneja upload, download y gestión de archivos multimedia.**

---

## 📋 Descripción

El **Files Service** es responsable de:

- ✅ Upload de archivos (imágenes, videos, documentos)
- ✅ Download de archivos
- ✅ Almacenamiento en MongoDB con GridFS
- ✅ Validación de tipos MIME
- ✅ Control de tamaños máximos
- ✅ Eliminación de archivos

---

## 🛠️ Stack Tecnológico

- **Express.js 4.22** - Framework HTTP
- **TypeScript** - Type safety
- **MongoDB 6+** - Base de datos NoSQL
- **Multer** - Middleware para upload
- **CORS** - Cross-Origin Resource Sharing

---

## 🏃 Ejecución

### Desarrollo
```bash
npm install
npm start
```

Accesible en: `http://localhost:4011`

### Producción
```bash
npm run build
npm start
```

---

## 📚 Endpoints API

### POST /upload
Subir archivo

**Multipart FormData:**
```
file: <archivo_binario>
```

**Response (200):**
```json
{
  "success": true,
  "file": {
    "id": "507f1f77bcf86cd799439011",
    "filename": "avatar.jpg",
    "mimetype": "image/jpeg",
    "size": 102400,
    "uploadedAt": "2024-01-20T10:30:00Z",
    "url": "http://localhost:4011/files/507f1f77bcf86cd799439011"
  }
}
```

### GET /files/:fileId
Descargar archivo

**Response:**
```
Content-Type: <tipo_mime_del_archivo>
Content-Disposition: attachment; filename="original_filename"
<contenido_binario_del_archivo>
```

### DELETE /files/:fileId
Eliminar archivo

**Response (200):**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### GET /files/:fileId/info
Obtener información del archivo

**Response (200):**
```json
{
  "success": true,
  "file": {
    "id": "507f1f77bcf86cd799439011",
    "filename": "avatar.jpg",
    "mimetype": "image/jpeg",
    "size": 102400,
    "uploadedAt": "2024-01-20T10:30:00Z"
  }
}
```

---

## 📄 Tipos MIME Soportados

```env
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,application/pdf
```

Por defecto soporta:
- **Imágenes:** JPEG, PNG, GIF, WebP
- **Videos:** MP4, WebM
- **Documentos:** PDF

---

## 📊 Límites

```env
# Tamaño máximo de archivo: 100MB
MAX_FILE_SIZE=104857600
```

---

## 🗄️ MongoDB Schema

```javascript
// GridFS almacena archivos con metadatos
db.fs.files.insertOne({
  _id: ObjectId,
  length: number,        // Tamaño en bytes
  chunkSize: 261120,     // Tamaño de chunk estándar
  uploadDate: Date,
  filename: string,
  contentType: string,
  metadata: {
    uploadedBy: string,
    uploadedAt: Date
  }
});

// Los chunks se almacenan en fs.chunks
db.fs.chunks.insertOne({
  _id: ObjectId,
  files_id: ObjectId,    // Referencia a fs.files
  n: number,             // Número de chunk
  data: BinData          // Datos binarios
});
```

---

## 📊 Variables de Entorno

```env
# MongoDB
MONGODB_URI=mongodb://admin:password@localhost:27017/files_db?authSource=admin

# Servidor
PORT=4011
NODE_ENV=development
BASE_URL=http://localhost:4011

# Seguridad
JWT_SECRET=tu-secret-jwt

# Archivos
MAX_FILE_SIZE=104857600
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,application/pdf

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 🔐 Validaciones

- ✅ Tipo MIME debe estar en lista de permitidos
- ✅ Tamaño de archivo no puede exceder MAX_FILE_SIZE
- ✅ Nombre de archivo se sanitiza
- ✅ Solo archivos, no directorios

---

## 📝 Ejemplo de Uso (Frontend)

```typescript
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('File uploaded:', data.file.url);
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

const downloadFile = (fileId: string, filename: string) => {
  window.open(`/api/files/${fileId}`, '_blank');
};

const deleteFile = async (fileId: string) => {
  const response = await fetch(`/api/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (data.success) {
    console.log('File deleted');
  }
};
```

---

## 🔗 Enlaces Relacionados

- [README Principal](../../README.md)
- [Docker Setup](../../docker-compose.yaml)

---

**Última actualización:** Enero 2026
