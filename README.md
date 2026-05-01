<div align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge&logo=mongodb" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/React_Konva-00d8ff?style=for-the-badge&logo=react&logoColor=white" alt="React Konva" />

  <br />
  <br />

  <h1>🎓 AttentionBuddy (Galgo School Sidecar)</h1>
  <p><strong>Herramienta avanzada de etiquetado de datos (Data Labeling Tool) para entrenar modelos de Visión Artificial en aulas educativas.</strong></p>
</div>

<br />

## 📖 Sobre el Proyecto

**AttentionBuddy** es una aplicación *sidecar* diseñada para integrarse con **Galgo School Manager**. Su objetivo principal es facilitar el etiquetado rápido y preciso de vídeos grabados en el aula para determinar los niveles de atención de los alumnos. 

A diferencia de las herramientas de etiquetado tradicionales, AttentionBuddy optimiza el flujo de trabajo estableciendo **zonas estáticas** (mesas) por cada vista de cámara, permitiendo al analista humano reproducir el vídeo y hacer etiquetado puntual sobre la marcha, sin tener que redibujar cajas fotograma a fotograma.

Este sistema generará un dataset estandarizado (YOLO / COCO) que servirá para entrenar futuros modelos de Machine Learning y Deep Learning orientados a la educación.

---

## ✨ Características Principales

- **🖼️ Diseñador de Plantillas (Canvas 2D):**
  Sube una imagen de referencia del aula y dibuja con precisión milimétrica las *Bounding Boxes* de las mesas usando `react-konva`.
  
- **🎥 Reproductor de Etiquetado en Tiempo Real:**
  Reproductor de vídeo integrado con controles de velocidad (1x hasta 3x). Al pausar el vídeo, las zonas estáticas se vuelven interactivas.

- **⚡ Etiquetado "Al Vuelo" (One-Click Labeling):**
  Ahorra cientos de horas. Solo necesitas pausar el vídeo y hacer clic en una mesa para catalogar su estado de atención en ese milisegundo exacto (🔴 Baja, 🟡 Media, 🟢 Alta).

- **💾 Optimización de Almacenamiento:**
  No extrae todo el vídeo a imágenes. Solo guarda el *timestamp* de la anotación, extrayendo bajo demanda únicamente los fotogramas clave útiles para el dataset.

- **🎨 UI/UX Premium:**
  Diseño estandarizado, estructurado y adaptativo, con soporte total para Modo Claro y Modo Oscuro usando CSS semántico puro en **Tailwind CSS v4**.

---

## 🛠️ Stack Tecnológico

El proyecto sigue una arquitectura **MERN Stack** orientada a monorepo:

* **Frontend:** React, Vite, React-Router-Dom, Tailwind CSS v4, React-Konva.
* **Backend:** Node.js, Express.js.
* **Base de Datos:** MongoDB, Mongoose, Docker (para entorno local).
* **Workspaces:** Gestión de procesos dual con `concurrently`.

---

## 🚀 Arquitectura de Modelos (Base de Datos)

Para lograr un rendimiento ultra-rápido de anotación, la arquitectura se divide en:
1. `ClassroomLayout`: Guarda las coordenadas X/Y y dimensiones de las mesas fijas.
2. `VideoSession`: Documento maestro de una grabación a procesar.
3. `AttentionAnnotation`: Cada anotación almacena una referencia a una mesa (`zoneId`), el `timestamp` exacto del vídeo y el `attentionLevel`.

---

## ⚙️ Instalación y Uso Local

Sigue estos pasos para arrancar el entorno completo (Cliente + Servidor + Base de Datos):

### 1. Requisitos
- Node.js (v18+)
- Docker y Docker Compose (para la base de datos)

### 2. Configurar Entorno
Clona el repositorio e instala las dependencias en la raíz, cliente y servidor.
```bash
git clone https://github.com/marchanero/galgo-attentionbuddy.git
cd galgo-attentionbuddy

# Instalar dependencias concurrentes en la raíz
npm install

# Instalar dependencias del cliente y servidor
cd client && npm install
cd ../server && npm install
cd ..
```

### 3. Base de Datos (Docker)
Levanta la instancia de MongoDB local usando el script preparado en el `package.json`:
```bash
npm run db:up
```

### 4. Lanzar la Aplicación
Ejecuta el frontend y el backend de forma simultánea gracias a `concurrently`:
```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api/health

---

## 🔮 Próximos Pasos (Roadmap)

- [x] Configuración inicial y clonado de estilos.
- [x] Implementación de Modo Oscuro nativo con variables semánticas.
- [x] Creación de modelos de Mongoose (Arquitectura basada en `timestamp`).
- [x] Editor Canvas (React-Konva) para plantillas estáticas.
- [x] Reproductor de vídeo para anotación instantánea.
- [ ] Módulo de carga (Upload) de vídeos con multer/S3.
- [ ] Exportador de Datasets (Pipeline ML) para generar `.txt` (YOLO) o `.json` (COCO).
- [ ] Autenticación de Analistas/Usuarios.

---
*Hecho con 💙 para el ecosistema Galgo School.*
