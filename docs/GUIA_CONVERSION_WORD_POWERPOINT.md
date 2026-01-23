# GUÍA DE CONVERSIÓN: Markdown → Word/PowerPoint

## Archivo 1: INFORME_TECNICO_COMPLETO.md
### Conversión a Microsoft Word (.docx)

#### Opción A: Usando Pandoc (Recomendado)

**Instalación:**
```bash
# Windows (con Chocolatey)
choco install pandoc

# macOS (con Homebrew)
brew install pandoc

# Linux (Debian/Ubuntu)
sudo apt-get install pandoc
```

**Conversión:**
```bash
# Navega a la carpeta docs
cd c:\Users\jettr\Documents\proyectosprogramacion\test\request-app\docs

# Convertir a Word
pandoc INFORME_TECNICO_COMPLETO.md -o INFORME_TECNICO_COMPLETO.docx

# Convertir a PDF (bonificación)
pandoc INFORME_TECNICO_COMPLETO.md -o INFORME_TECNICO_COMPLETO.pdf
```

**Resultado:**
- ✅ Documento Word profesional
- ✅ Tabla de contenidos automática
- ✅ Formato preservado
- ✅ Links funcionales

#### Opción B: Usando Online Converter

1. Ve a: https://cloudconvert.com/md-to-docx
2. Sube: `INFORME_TECNICO_COMPLETO.md`
3. Descarga: `INFORME_TECNICO_COMPLETO.docx`

#### Opción C: Copiar a Word Directamente

1. Abre Microsoft Word
2. Crea un documento nuevo
3. Copia el contenido del archivo Markdown
4. Pega en Word como "Unformatted Text"
5. Aplica estilos manualmente

**Mejoramiento post-conversión en Word:**
```
1. Tabla de contenidos
   → Referencias → Tabla de contenidos → Automática

2. Estilos
   → Selecciona títulos → Aplicar estilos predefinidos

3. Portada
   → Insertar → Portada → Elige diseño

4. Headers/Footers
   → Insertar → Encabezado/Pie → Añade número de página

5. Imágenes
   → Añade diagramas como imágenes en lugares clave

6. Contraseña
   → Archivo → Proteger documento → Contraseña
```

---

## Archivo 2: PRESENTATION_RESUMEN_EJECUTIVO.md
### Conversión a PowerPoint (.pptx)

#### Opción A: Usando Pandoc (Recomendado)

```bash
# Convertir Markdown a PowerPoint
pandoc PRESENTATION_RESUMEN_EJECUTIVO.md -t pptx -o PRESENTATION_RESUMEN_EJECUTIVO.pptx

# Con opciones avanzadas
pandoc PRESENTATION_RESUMEN_EJECUTIVO.md \
  -t pptx \
  -o PRESENTATION_RESUMEN_EJECUTIVO.pptx \
  --slide-level 2 \
  --variable theme=default
```

**Divisiones de slides:**
- Cada `##` (heading 2) = nueva slide
- Cada `###` (heading 3) = nueva subsección
- Contenido entre headings = contenido de la slide

#### Opción B: Usando iCloud/Google Slides (En línea)

**Alternativa online gratuita:**

1. Ve a: https://www.icloud.com (Números) o Google Slides
2. Abre un documento en blanco
3. Copia el contenido Markdown
4. Formatea manualmente
5. Descarga como PPTX

#### Opción C: Herramienta Especializada

**Marp** (Markdown Presentation):
```bash
npm install -g @marp-team/marp-cli

# Convertir
marp PRESENTATION_RESUMEN_EJECUTIVO.md --output PRESENTATION_RESUMEN_EJECUTIVO.pptx
```

**Mejoramiento post-conversión en PowerPoint:**

```
1. Diseño y temas
   → Diseño → Temas → Elige tema profesional
   → Variaciones → Colores de marca

2. Transiciones
   → Transiciones → Aplica efecto (Fade recomendado)

3. Animaciones
   → Animaciones → Añade entrada a elementos clave
   → Timing: On Click o After Previous

4. Imágenes
   → Inserta diagramas ASCII como imágenes
   → Formatea con sombra y bordes

5. Notas del presentador
   → Selecciona vista "Notas"
   → Añade puntos de conversación

6. Portada
   → Slide 1 → Insertar → Portada profesional
   → Cambiar título, subtítulo, fecha

7. Pie de página
   → Insertar → Encabezado y pie de página
   → Número de slide + fecha
   → No mostrar en portada

8. Transición total
   → Transiciones → Aplicar a todas las slides
```

---

## Recomendaciones de Estilo

### Para el Informe Word

**Formato sugerido:**
```
Portada
  - Título: "INFORME TÉCNICO COMPLETO"
  - Subtítulo: "Request App - Red Universitaria"
  - Fecha y autor

Página índice
  - Tabla de contenidos automática
  
Cuerpo
  - Márgenes: 2.5 cm
  - Fuente: Calibri 11pt / Times 12pt
  - Interlineado: 1.5
  - Justificado

Tablas
  - Encabezados en azul oscuro
  - Filas alternas gris claro
  - Bordes sutiles

Código
  - Fuente: Courier New 9pt
  - Fondo gris claro
  - Altura mínima de línea

Imágenes
  - Ancho máximo: 15 cm
  - Comprimidas
  - Con caption numerado
```

**Pie de página sugerido:**
```
INFORME TÉCNICO - REQUEST APP | Enero 2026 | Confidencial
```

### Para la Presentación PowerPoint

**Formato sugerido:**
```
Plantilla
  - Colores: Azul profesional + blanco + gris
  - Fuente: Arial/Helvetica
  - Ratio: 16:9 (moderno)

Master Slide (diseño)
  - Logo en esquina superior derecha
  - Línea decorativa inferior
  - Numeración de slide

Contenido
  - Max 5-6 líneas por slide
  - Puntos en lugar de párrafos
  - Imágenes > texto (regla 70/30)

Colores
  - Título: Azul (#0066CC)
  - Subtítulo: Gris oscuro (#333333)
  - Fondo: Blanco o gris muy claro

Transiciones
  - Slide a slide: Fade (0.5s)
  - Elementos: Push (0.3s)
```

---

## Alternativa Premium: Convertidores Online

Si prefieres no instalar software:

### Word (Informe)

1. **CloudConvert** - https://cloudconvert.com
   - Sube archivo Markdown
   - Selecciona "Word Document"
   - Descarga resultado

2. **Zamzar** - https://www.zamzar.com
   - Interface intuitiva
   - Conversiones de alta calidad

3. **Online-Convert** - https://www.online-convert.com
   - Gratuito sin registro
   - Múltiples formatos

### PowerPoint (Presentación)

1. **CloudConvert** (PowerPoint format)
   - Mismo proceso que Word
   - Selecciona "Microsoft PowerPoint"

2. **Marp Editor** - https://marp.app
   - Editor online
   - Preview en tiempo real
   - Descarga como PPTX

3. **DeckDeckGo** - https://deckdeckgo.com
   - Diseñado para presentaciones
   - Templates profesionales
   - Export a PPTX

---

## Scripts Automáticos

### Windows PowerShell Script

```powershell
# Guardar como: convert-docs.ps1

# Instalar pandoc si no está instalado
if (!(Get-Command pandoc -ErrorAction SilentlyContinue)) {
    Write-Host "Instalando Pandoc..."
    choco install pandoc -y
}

$docsPath = "c:\Users\jettr\Documents\proyectosprogramacion\test\request-app\docs"

# Convertir informe a Word
Write-Host "Convirtiendo informe a Word..."
pandoc "$docsPath\INFORME_TECNICO_COMPLETO.md" `
  -o "$docsPath\INFORME_TECNICO_COMPLETO.docx"

# Convertir presentación a PowerPoint
Write-Host "Convirtiendo presentación a PowerPoint..."
pandoc "$docsPath\PRESENTATION_RESUMEN_EJECUTIVO.md" `
  -t pptx `
  -o "$docsPath\PRESENTATION_RESUMEN_EJECUTIVO.pptx" `
  --slide-level 2

Write-Host "✅ Conversiones completadas!"
Write-Host "- Informe: $docsPath\INFORME_TECNICO_COMPLETO.docx"
Write-Host "- Presentación: $docsPath\PRESENTATION_RESUMEN_EJECUTIVO.pptx"
```

**Para ejecutar:**
```bash
powershell -ExecutionPolicy Bypass -File convert-docs.ps1
```

### Bash Script (Linux/macOS)

```bash
#!/bin/bash

# Guardar como: convert-docs.sh

DOCS_PATH="$HOME/Documents/proyectosprogramacion/test/request-app/docs"

echo "Verificando pandoc..."
if ! command -v pandoc &> /dev/null; then
    echo "Instalando pandoc..."
    # macOS
    brew install pandoc
    # O Linux: sudo apt-get install pandoc
fi

echo "Convirtiendo informe a Word..."
pandoc "$DOCS_PATH/INFORME_TECNICO_COMPLETO.md" \
  -o "$DOCS_PATH/INFORME_TECNICO_COMPLETO.docx"

echo "Convirtiendo presentación a PowerPoint..."
pandoc "$DOCS_PATH/PRESENTATION_RESUMEN_EJECUTIVO.md" \
  -t pptx \
  -o "$DOCS_PATH/PRESENTATION_RESUMEN_EJECUTIVO.pptx" \
  --slide-level 2

echo "✅ Conversiones completadas!"
echo "- Informe: $DOCS_PATH/INFORME_TECNICO_COMPLETO.docx"
echo "- Presentación: $DOCS_PATH/PRESENTATION_RESUMEN_EJECUTIVO.pptx"
```

**Para ejecutar:**
```bash
chmod +x convert-docs.sh
./convert-docs.sh
```

---

## Validación Post-Conversión

### Checklist para Word

- [ ] Tabla de contenidos genera correctamente
- [ ] Títulos mantienen formato
- [ ] Tablas se ven legibles
- [ ] Código formateado adecuadamente
- [ ] Links funcionan
- [ ] Números de página correctos
- [ ] Márgenes consistentes
- [ ] Saltos de página en lugares lógicos

### Checklist para PowerPoint

- [ ] Cada slide visible claramente
- [ ] Texto legible (mín 18pt)
- [ ] Imágenes insertadas
- [ ] Transiciones funcionan
- [ ] Notas del presentador presentes
- [ ] Portada profesional
- [ ] Pie de página completo
- [ ] Numeración correcta

---

## Distribución

### Para Email

**Informe Word:**
```
Asunto: REQUEST APP - Informe Técnico Completo v1.0

Cuerpo:
Adjunto encontrarás el informe técnico completo del proyecto
Request App, incluyendo:

✅ Arquitectura general
✅ Descripción de infraestructura
✅ 11 Microservicios detallados
✅ Patrones de comunicación
✅ Modelos de arquitectura
✅ Recomendaciones

Documento clasificado como CONFIDENCIAL.
Acceso restringido a equipo técnico y stakeholders autorizados.

---
Jettro
Tech Lead - Request App
```

**Presentación PowerPoint:**
```
Asunto: REQUEST APP - Presentación Ejecutiva

Cuerpo:
Adjunto la presentación de resumen ejecutivo de Request App,
optimizada para stakeholders y directivos.

📊 20 slides profesionales
⏱️ Duración: 30-45 minutos (con preguntas)
👥 Audiencia: C-level, directivos, inversionistas

Documento CONFIDENCIAL - Uso interno autorizado.

---
Jettro
Tech Lead - Request App
```

### Para Presentación

**Antes de presentar:**
1. Abre PowerPoint en modo "Presenter View"
2. Notas del presentador en pantalla principal
3. Audiencia ve slideshow full-screen
4. Practica transiciones y timing
5. Ten Word abierto como referencia técnica

**Tips de presentación:**
- Empieza con portada profesional
- Narración clara y pausada
- Evita leer slides (atiende a público)
- Mantén referencia técnica a mano
- Finaliza con slide de contacto
- Deja tiempo para preguntas

---

## Troubleshooting

### Problema: Pandoc no convierte correctamente

**Solución:**
```bash
# Asegúrate que está instalado
pandoc --version

# Reinstalar
choco uninstall pandoc -y
choco install pandoc -y

# O actualizar
choco upgrade pandoc
```

### Problema: Estilos no aplican en Word

**Solución:**
1. Abre Word documento
2. Menú → Estilos (Shift+Ctrl+S)
3. Importa estilos personalizados
4. Aplica manualmente a secciones

### Problema: PowerPoint slide levels incorrecto

**Solución:**
```bash
# Cambiar nivel de heading para slides
pandoc presentation.md \
  -t pptx \
  -o presentation.pptx \
  --slide-level 3  # Usa h3 en lugar de h2
```

### Problema: Imágenes no aparecen

**Solución:**
1. En Markdown: usa rutas relativas: `![Alt](../images/diagram.png)`
2. Coloca imágenes en carpeta `images/`
3. Reconvierte con Pandoc

---

## Próximos Pasos

1. **Inmediato:**
   - [ ] Generar archivos Word y PowerPoint
   - [ ] Revisar formato y contenido
   - [ ] Ajustar estilos según marca

2. **Corto plazo:**
   - [ ] Añadir imágenes/diagramas profesionales
   - [ ] Traducir a otros idiomas (opcional)
   - [ ] Generar resumen ejecutivo (1-2 páginas)

3. **Distribución:**
   - [ ] Enviar a stakeholders
   - [ ] Presentar en reuniones
   - [ ] Obtener feedback
   - [ ] Iterar versiones

---

**Guía preparada por:** Jettro  
**Fecha:** Enero 2026  
**Versión:** 1.0
