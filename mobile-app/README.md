# 📱 Mobile App - React Native + Expo

**Aplicación móvil nativa para Android e iOS usando React Native y Expo.**

---

## 📋 Descripción

La **Mobile App** proporciona acceso a Request App en dispositivos móviles:

- ✅ Interfaz nativa (iOS/Android)
- ✅ Autenticación y sesiones
- ✅ Navegación optimizada para móvil
- ✅ Notificaciones push
- ✅ Acceso a cámara y galería
- ✅ Sincronización offline-ready

---

## 🛠️ Stack Tecnológico

- **React Native 0.81** - Framework móvil
- **Expo ~54.0** - Plataforma development
- **TypeScript** - Type safety
- **React Navigation** - Navegación
- **Axios** - HTTP client
- **AsyncStorage** - Almacenamiento local

---

## 📁 Estructura

```
mobile-app/
├── App.js                  # Componente raíz
├── app.json               # Configuración Expo
├── index.js               # Entry point
├── assets/                # Imágenes, fuentes
├── src/
│   ├── screens/           # Pantallas
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── PostsScreen.tsx
│   │   └── ChatScreen.tsx
│   ├── components/        # Componentes compartidos
│   ├── hooks/             # Custom hooks
│   ├── services/          # API calls
│   ├── types/             # TypeScript types
│   └── utils/             # Utilidades
├── eas.json              # Expo Application Services config
└── package.json
```

---

## 🚀 Instalación

### Requisitos

- Node.js 16+
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) o Android Emulator

### Setup

```bash
cd mobile-app

npm install

# Variables de entorno
cp .env.example .env

# Editar .env
```

---

## 📝 Variables de Entorno

```env
# API
EXPO_PUBLIC_API_URL=http://localhost/api
EXPO_PUBLIC_API_TIMEOUT=30000

# Auth
EXPO_PUBLIC_AUTH_PROVIDER=nextauth

# Debug
DEBUG=false
```

---

## 🏃 Ejecución

### Desarrollo Local

```bash
# Iniciar Expo CLI
npm start
```

Opciones:
- **a** - Abrir en Android Emulator
- **i** - Abrir en iOS Simulator
- **w** - Abrir en web
- **j** - Abrir Debugger
- **r** - Reload app

### Emulador Android
```bash
npm run android
```

### Emulador iOS (solo Mac)
```bash
npm run ios
```

### Web Preview
```bash
npm run web
```

---

## 📱 Screens Principales

### Home Screen
- Pantalla inicial
- CTA para login
- Información general

### Login Screen
- Autenticación
- Registro de nuevo usuario
- Remember me

### Dashboard Screen
- Feed principal
- Actividades recientes
- Acceso rápido

### Posts Screen
- Listado de posts
- Crear nuevo post
- Filtros

### Profile Screen
- Información de perfil
- Editar datos
- Settings

### Chat Screen
- Conversaciones
- Chat en tiempo real
- Notificaciones

---

## 🔐 Autenticación

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const login = async (email: string, password: string) => {
  const response = await axios.post('/api/auth/login', {
    email,
    password
  });

  if (response.data.token) {
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
  }

  return response.data;
};

const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

const getToken = async () => {
  return await AsyncStorage.getItem('token');
};
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Coverage
npm run test:coverage
```

---

## 📦 Build y Deploy

### Expo Cloud Build

```bash
# Login a Expo
expo login

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios

# Build for store
eas build --platform all
```

### APK/IPA Local

```bash
# Android APK
eas build --platform android --local

# iOS IPA
eas build --platform ios --local
```

---

## 🔗 Enlaces Relacionados

- [README Principal](../../README.md)
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo EAS](https://eas.expo.dev/)

---

## 📸 Permisos

El archivo `app.json` configura permisos necesarios:

```json
{
  "plugins": [
    [
      "expo-camera",
      {
        "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera"
      }
    ],
    [
      "expo-media-library",
      {
        "photosPermission": "Allow $(PRODUCT_NAME) to access your photos",
        "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos"
      }
    ]
  ]
}
```

---

**Última actualización:** Enero 2026
