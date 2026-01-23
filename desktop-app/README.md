# 🖥️ Desktop App - Electron Admin

**Aplicación de escritorio para administración y monitoreo de microservicios.**

---

## 📋 Descripción

La **Desktop Admin App** proporciona herramientas administrativas:

- ✅ Monitoreo de microservicios
- ✅ Gestión de usuarios
- ✅ Visualización de logs
- ✅ Estadísticas en tiempo real
- ✅ Configuración de sistema
- ✅ Reportes

---

## 🛠️ Stack Tecnológico

- **Electron 40.0** - Framework desktop
- **Node.js 20+** - Runtime
- **React** - UI (opcional)
- **HTML/CSS/JavaScript** - Frontend

---

## 📁 Estructura

```
desktop-app/
├── main.js              # Main process
├── preload.js           # Preload script (seguridad)
├── index.html           # UI principal
├── styles/              # CSS
├── src/
│   ├── main/            # Main process files
│   ├── renderer/        # Renderer process
│   └── utils/           # Utilidades
├── forge.config.js      # Electron Forge config
└── package.json
```

---

## 🚀 Instalación

```bash
cd desktop-app

npm install
```

---

## 🏃 Ejecución

### Desarrollo

```bash
npm start
```

Abre la aplicación Electron en modo desarrollo.

### Build

```bash
npm run make
```

Genera instaladores para:

- Windows (.exe, .msi)
- macOS (.dmg)
- Linux (.deb, .rpm)

### Package

```bash
npm run package
```

---

## 🏗️ Estructura Main Process

```typescript
// main.js
const { app, BrowserWindow } = require('electron');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();
});

app.on('window-all-closed', () => {
  app.quit();
});
```

---

## 🔐 Seguridad

### Preload Script

```typescript
// preload.js
const { contextBridge, ipcMain } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getSystemStats: () => ipcMain.invoke('get-system-stats'),
  getServiceStatus: () => ipcMain.invoke('get-service-status'),
  restartService: (name) => ipcMain.invoke('restart-service', name),
});
```

### Uso en Renderer

```javascript
// index.html / renderer process
const stats = await window.api.getSystemStats();
console.log(stats);
```

---

## 📊 Funcionalidades Principales

### Dashboard

- Estado de servicios
- Métricas del sistema
- Logs recientes

### Microservicios

- Listado de servicios
- Health checks
- Restart/Stop/Start

### Usuarios

- Gestión de usuarios
- Estadísticas de actividad
- Búsqueda y filtros

### Logs

- Visualización de logs
- Filtros por servicio
- Export a archivo

### Settings

- Configuración de conexión
- Tokens de API
- Preferencias

---

## 🔗 API Calls

```javascript
// Llamar a API desde Electron
const axios = require('axios');

const getServices = async () => {
  const response = await axios.get('http://localhost/api/admin/services');
  return response.data;
};

const restartService = async (serviceName) => {
  const response = await axios.post(
    `http://localhost/api/admin/services/${serviceName}/restart`,
    {},
  );
  return response.data;
};
```

---

## 📦 Build para Distribución

### Windows

```bash
npm run make -- --platform win32
```

Genera: `.exe` y `.msi`

### macOS

```bash
npm run make -- --platform darwin
```

Genera: `.dmg`

### Linux

```bash
npm run make -- --platform linux
```

Genera: `.deb`, `.rpm`

---

## 🧪 Testing

```bash
npm run test
```

---

## 🔗 Enlaces Relacionados

- [README Principal](../../README.md)
- [Electron Docs](https://www.electronjs.org/docs)
- [Electron Forge](https://www.electronforge.io/)

---

## ⚙️ Configuración Forge

El archivo `forge.config.js` configura:

```javascript
module.exports = {
  packagerConfig: {
    name: 'Request Admin',
    icon: './assets/icon',
    asar: true,
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: { certificateFile: './cert.pfx' },
    },
    {
      name: '@electron-forge/maker-zip',
    },
  ],
};
```

---

**Última actualización:** Enero 2026
