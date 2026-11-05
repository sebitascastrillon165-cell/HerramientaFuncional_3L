# Pesebrera3L-Desk

Aplicacion de escritorio para **Windows 10/11 x64** que administra una pesebrera exclusiva de
**equinos (caballos)** y **mulares (mulas)**, construida conforme al **IEEE Std 830-1998**.

Gestiona: pesebreras (disponibles/llenas), equinos y mulares vinculados a pesebrera y montador,
montadores con disponibilidad y carga exacta de animales, dashboard con metricas en tiempo real,
tarifas y servicios (alquiler, mantenimiento por animal), y un modulo avanzado de accesibilidad
visual (5 temas, modos claro/oscuro/alto contraste y perfiles de daltonismo: Protanopia,
Deuteranopia y Tritanopia).

## Stack

- **Frontend:** Electron + HTML5 semantico + CSS3 (header, aside.sidebar, main.content, footer).
  Iconografia **Font Awesome** y notificaciones **SweetAlert**.
- **Backend:** Python 3.10+ con **FastAPI** (API REST local) + **SQLite** (integridad referencial).
- **Comunicacion:** Puente IPC entre Electron (renderer) y Python, con `fetch` fallback.
- **Empaquetado:** `.exe` portable (Electron Builder) con el nucleo Python congelado (PyInstaller).

## Requisitos

- Windows 10/11 x64.
- Para ejecutar en desarrollo: **Python 3.10+** y **Node.js 18+**.
- Para empaquetar: `pip install pyinstaller` y `npm install` en la raiz del proyecto.

## Instalacion y ejecucion (desarrollo)

```powershell
pip install -r backend/requirements.txt
npm install
npm run backend   # levanta el servidor FastAPI en http://127.0.0.1:8000
npm start         # abre la ventana de Electron
```

`npm run backend` (terminal 1) levanta el nucleo Python; `npm start` (terminal 2) levanta la UI.

## Pruebas

```powershell
# Backend (logica de negocio, API REST, respaldo al cierre): 16 pruebas
python -m pytest backend/tests -q

# Frontend (motor de temas y HTML semantico): 8 pruebas
npm test
```

## Empaquetado (.exe portable para Windows x64)

1. Construir el nucleo Python congelado:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-backend-exe.ps1
```

2. Construir el ejecutable portable:

```powershell
npx electron-builder --win portable
```

Artefacto generado: `release/Pesebrera3L-Desk-1.0.0-portable.exe` (Git LFS en este repo).
El backend congelado se copia desde `dist/pesebrera3l-backend.exe` a
`resources/backend/pesebrera3l-backend.exe` dentro del paquete.

## Estructura de carpetas

```
.
├── IEEE-830-(3L).md            # ERS fuente de verdad (IEEE Std 830-1998)
├── backend/
│   ├── app/                    # API REST FastAPI + servicios de negocio
│   │   ├── main.py             # lifespan: init DB + backup automatico
│   │   ├── database.py         # SQLite, esquema, sesiones, respaldo
│   │   ├── core/exceptions.py
│   │   ├── routers/            # pesebreras, animales, montadores, tarifas, dashboard
│   │   └── services/           # logica: queries, estable, montadores, animales, tarifas, dashboard
│   ├── tests/                  # suite pytest (API REST, integracion, backup)
│   ├── requirements.txt
│   └── run_server.py           # entry point para PyInstaller
├── electron/
│   ├── main.js                 # proceso principal Electron + IPC + spawn del backend
│   ├── preload.js              # contextBridge: window.electronAPI.invokeApi
│   ├── renderer/
│   │   ├── index.html          # HTML5 semantico
│   │   ├── styles/             # base.css + themes.css (5 temas x 3 modos + daltonismo)
│   │   └── js/                 # theme-engine.js (esable, expone ThemeEngine) + app.js
├── scripts/build-backend-exe.ps1
├── tests/frontend/             # node --test (theme-engine + HTML semantico)
├── docs/fases/                 # planeacion y actas por fase (IEEE 830)
└── release/Pesebrera3L-Desk-1.0.0-portable.exe  # artefacto (LFS)
```

## Capas

- **CSS/temas:** `electron/renderer/styles/`
- **JS/Electron:** `electron/`
- **API Python:** `backend/`

## ERS

Ver `IEEE-830-(3L).md` en la raiz (fuente de verdad) y `docs/fases/` para el seguimiento por fases.

## Entregas y notas

- **Roles:** Administrador (acceso total, tarifas, asignaciones, reportes API) y Personal operativo
  (consulta y registro de novedades) — implementado por politica de UI por modulos.
- **Accesibilidad visual:** 5 temas; cada tema con modo claro, oscuro y alto contraste; perfiles de
  daltonismo (Protanopia, Deuteranopia, Tritanopia) que sobrescriben la paleta.
- **Integridad referencial:** claves foraneas con `PRAGMA foreign_keys=ON`; respaldo automatico al cierre
  del backend.
- **Rendimiento objetivo:** renderizado de modulos/temas en menos de 200 ms; operaciones locales del
  servidor Python en menos de 300 ms.