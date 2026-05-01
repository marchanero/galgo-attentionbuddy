<div align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge&logo=mongodb" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/React_Konva-00d8ff?style=for-the-badge&logo=react&logoColor=white" alt="React Konva" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />

  <br />
  <br />

  <h1>🎓 AttentionBuddy</h1>
  <p><strong>Herramienta profesional de etiquetado de vídeo para entrenar modelos de Visión Artificial y análisis de atención en aulas educativas.</strong></p>
  <p><em>Sidecar de <a href="https://github.com/marchanero/galgo_school_manager_AI">Galgo School Manager AI</a></em></p>
</div>

---

## 📖 Sobre el Proyecto

**AttentionBuddy** es una herramienta de *Data Labeling* diseñada para generar datasets de alta calidad que sirvan para entrenar futuros modelos de Machine Learning orientados al análisis de atención en el aula.

La herramienta captura **dos dimensiones complementarias** de información:

1. **Percepción subjetiva del docente** — La valoración humana experta como *ground truth* del modelo.
2. **Indicadores observables** — Datos estructurados (pose de cabeza, postura corporal, actividad, engagement) que el futuro modelo de visión artificial aprenderá a detectar de forma automática.

El principio de diseño central es **velocidad sin perder riqueza de datos**: el docente puede etiquetar una clase de 8 mesas en segundos gracias al sistema de Presets y atajos de teclado.

---

## ✨ Características Principales

### ⚡ Sistema de Presets de Etiquetado (1 Clic = 1 Anotación Completa)
El flujo de trabajo más innovador de la herramienta. Define plantillas predefinidas que encapsulan todo un escenario de atención:

- **7 Presets por defecto:** Atento escribiendo, Atento al profesor, Participando, Pasivo, Hablando con compañero, Mirando móvil, Distraído total.
- **Atajos de teclado `1-7`:** Cambiar el preset activo al vuelo sin apartar los ojos del vídeo.
- **Gestor de Presets:** Crea, edita y elimina tus propios presets personalizados con icono, atajo y todos los indicadores.

### 🎥 Reproductor de Etiquetado en Tiempo Real
- Controles de velocidad: **1x, 1.5x, 2x, 3x** para revisar el vídeo rápidamente.
- **Modo Rápido (clic simple):** Aplica el preset activo a una zona en un clic.
- **Modo Detallado (doble clic):** Abre un panel completo para anotaciones especiales con notas libres.
- **Barra de progreso interactiva** con marcadores visuales en cada anotación guardada.

### ⌨️ Atajos de Teclado Globales
| Tecla | Acción |
|-------|--------|
| `Espacio` | Play / Pausa |
| `1` – `7` | Seleccionar preset activo |
| `←` / `→` | Retroceder / Avanzar 5 segundos |
| `Doble clic` en zona | Modo Detallado (formulario completo) |

### 🖼️ Diseñador de Plantillas de Aula (Canvas 2D)
- Sube una imagen de referencia del aula.
- Dibuja las *Bounding Boxes* de las mesas con **React-Konva** de forma visual.
- Las zonas son **estáticas por cámara**: solo hay que configurarlas una vez y se reutilizan en todos los vídeos.
- Guarda el layout en MongoDB para que el reproductor las cargue automáticamente.

### 🧠 Modelo de Datos Enriquecido para ML
Cada anotación guarda información multi-dimensional diseñada para el entrenamiento de modelos:
- `teacherPerception`: Percepción subjetiva del docente en 5 niveles.
- `observableIndicators.headPose`: Dirección de la mirada (frente, abajo, lejos...).
- `observableIndicators.bodyPosture`: Postura corporal (erguido, encorvado...).
- `observableIndicators.activity`: Actividad detectada (escribiendo, leyendo, móvil...).
- `observableIndicators.engagement`: Nivel de implicación (activo, pasivo, distraído...).
- `notes`: Campo libre para observaciones contextuales del docente.

### 🎨 UI/UX Premium con Modo Oscuro
- Diseño heredado de **Galgo School Manager AI** para consistencia visual.
- Modo Claro / Oscuro persistente con **ThemeContext** + `localStorage`.
- Basado en **Tailwind CSS v4** con `@custom-variant dark` y variables semánticas.

---

## 🏗️ Arquitectura del Proyecto

```
galgo-attentionbuddy/
├── client/                      # React + Vite + Tailwind CSS v4
│   └── src/
│       ├── context/
│       │   └── ThemeContext.jsx  # Dark/Light mode persistente
│       ├── components/
│       │   ├── Layout.jsx        # Shell: Sidebar + Navbar
│       │   ├── Sidebar.jsx       # Navegación con React Router
│       │   └── Navbar.jsx        # Toggle de tema
│       └── pages/
│           ├── Dashboard.jsx     # Panel principal con estadísticas
│           ├── LayoutBuilder.jsx # Editor Canvas para zonas estáticas
│           ├── PresetManager.jsx # CRUD de Presets de etiquetado
│           └── VideoAnnotator.jsx# Reproductor + etiquetado en tiempo real
└── server/                      # Express + Mongoose
    ├── models/
    │   ├── ClassroomLayout.js    # Zonas estáticas por cámara
    │   ├── VideoSession.js       # Sesiones de vídeo a procesar
    │   ├── AttentionAnnotation.js# Etiquetas con percepción + indicadores
    │   └── AnnotationPreset.js   # Plantillas de etiquetado rápido
    └── routes/
        └── api.js                # REST API completa
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, Vite, React Router DOM |
| Estilos | Tailwind CSS v4 (`@custom-variant dark`) |
| Canvas | React-Konva, Konva, use-image |
| Backend | Node.js, Express.js (ES Modules) |
| ORM | Mongoose 8 |
| Base de Datos | MongoDB (Docker Compose) |
| Dev Tools | Concurrently, Dotenvx |

---

## 🗄️ Modelos de Base de Datos

### `ClassroomLayout`
```javascript
{
  name: String,
  backgroundImageUrl: String,
  zones: [{ label, coordinates: { x, y, width, height } }]
}
```

### `AnnotationPreset`
```javascript
{
  name: String,          // "Atento escribiendo"
  icon: String,          // "🟢"
  shortcutKey: String,   // "1"
  teacherPerception: Enum['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'],
  observableIndicators: { headPose, bodyPosture, activity, engagement },
  isDefault: Boolean
}
```

### `AttentionAnnotation`
```javascript
{
  sessionId: ObjectId,
  timestamp: Number,       // Segundos exactos del vídeo
  zoneId: String,
  teacherPerception: Enum, // Ground truth del modelo ML
  observableIndicators: {
    headPose: Enum,        // LOOKING_FRONT | DOWN | AWAY | PEER | NOT_VISIBLE
    bodyPosture: Enum,     // UPRIGHT | SLOUCHED | LEANING_FORWARD | ...
    activity: Enum,        // WRITING | READING | TALKING | USING_DEVICE | ...
    engagement: Enum       // ACTIVE | PASSIVE | DISTRACTED | ASLEEP
  },
  notes: String
}
```

---

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/layouts` | Listar plantillas de aula |
| `POST` | `/api/layouts` | Crear plantilla |
| `GET` | `/api/sessions` | Listar sesiones de vídeo |
| `POST` | `/api/sessions` | Crear sesión |
| `POST` | `/api/annotations` | Guardar anotación (upsert) |
| `GET` | `/api/annotations/:sessionId` | Obtener anotaciones de una sesión |
| `GET` | `/api/presets` | Listar presets |
| `POST` | `/api/presets` | Crear preset |
| `PUT` | `/api/presets/:id` | Actualizar preset |
| `DELETE` | `/api/presets/:id` | Eliminar preset |
| `POST` | `/api/presets/seed` | Auto-poblar presets por defecto |

---

## 🚀 Instalación y Uso Local

### Requisitos
- Node.js v18+
- Docker y Docker Compose

### 1. Clonar el repositorio
```bash
git clone https://github.com/marchanero/galgo-attentionbuddy.git
cd galgo-attentionbuddy
```

### 2. Instalar dependencias
```bash
# Raíz (concurrently)
npm install

# Cliente
cd client && npm install

# Servidor
cd ../server && npm install
cd ..
```

### 3. Configurar entorno del servidor
```bash
# server/.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/attentionbuddy
```

### 4. Levantar la base de datos
```bash
npm run db:up
```

### 5. Lanzar la aplicación completa
```bash
npm run dev
```

| Servicio | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api/health |

---

## 🔮 Roadmap

- [x] Scaffolding MERN con concurrently
- [x] MongoDB Dockerizado
- [x] Sistema de Modo Oscuro nativo (Tailwind v4)
- [x] Modelos Mongoose (Layout, Session, Annotation, Preset)
- [x] API REST completa
- [x] Editor Canvas con React-Konva (zonas estáticas)
- [x] Reproductor de vídeo con controles de velocidad
- [x] Sistema de Presets con atajos de teclado (Quick Mode)
- [x] Modo Detallado (formulario completo con notas)
- [x] Gestor de Presets (CRUD visual)
- [x] Modelo de datos enriquecido (percepción + indicadores observables)
- [ ] Subida de vídeos reales (multer / S3)
- [ ] Gestión de Sesiones (selección de vídeo + layout)
- [ ] Exportador de Datasets ML (formato YOLO `.txt` / COCO `.json`)
- [ ] Autenticación de Docentes (JWT)
- [ ] Integración con datos de alumnos de Galgo School Manager

---

*Hecho con 💙 para el ecosistema Galgo School · [galgo_school_manager_AI](https://github.com/marchanero/galgo_school_manager_AI)*
