# Pesebrera3L-Desk

Aplicacion de escritorio para **Windows 10/11 x64** que administra una pesebrera exclusiva de
**equinos (caballos)** y **mulares (mulas)**, construida conforme al **IEEE Std 830-1998**.

Gestiona: pesebreras (disponibles/llenas), equinos y mulares vinculados a pesebrera y montador,
montadores con disponibilidad y carga exacta de animales, dashboard con metricas en tiempo real,
tarifas y servicios (alquiler, mantenimiento por animal), y un modulo avanzado de accesibilidad
visual (5 temas, modos claro/oscuro/alto contraste y perfiles de daltonismo: Protanopia,
Deuteranopia y Tritanopia). Incluye un **panel de control** en el que se puede cambiar el puerto
de la API local.

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
El puerto por defecto es `8000` y se puede cambiar desde el panel de control (ver abajo).

## Panel de control (cambiar el puerto)

La aplicacion incluye un panel de control en la barra lateral (`Panel de control`, icono de
ajustes) que permite cambiar el puerto de la API local:

1. Menú lateral -> **Panel de control**.
2. Ingresar el puerto (1-65535, por defecto 8000) en el campo "Puerto de la API local".
3. Pulsar **Guardar y reiniciar**.
4. La aplicacion persiste la configuracion en `userData/config.json`, reinicia el backend Python
   con el nuevo puerto y el renderer sigue usando `http://127.0.0.1:<puerto>` para sus peticiones.

- En el paquete portable, el arranque del backend usa la variable de entorno `PESEBRERA3L_PORT`.
- En desarrollo, el proceso `npm run backend` también respeta `PESEBRERA3L_PORT` (por defecto 8000).
- Si se ejecuta solo el renderer (sin Electron/IPC) el valor se toma de `localStorage` y es necesario
  reiniciar el backend manualmente.
- La validacion del puerto (1-65535) vive en `electron/lib/port.js` y esta cubierta por pruebas.

## Pruebas

```powershell
# Backend (logica de negocio, API REST, respaldo al cierre): 20 pruebas
python -m pytest backend/tests -q

# Frontend (motor de temas, HTML semantico, panel de control y validacion de puerto): 13 pruebas
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

## Estructura de carpetas

```
.
├── IEEE-830-(3L).md            # ERS fuente de verdad (IEEE Std 830-1998)
├── backend/
│   ├── app/                    # API REST FastAPI + servicios de negocio
│   │   ├── main.py             # lifespan: init DB + backup automatico
│   │   ├── database.py         # SQLite, esquema, sesiones, respaldo, PESEBRERA3L_DATA
│   │   ├── core/exceptions.py
│   │   ├── routers/            # pesebreras, animales, montadores, tarifas, dashboard
│   │   └── services/           # queries, estable, montadores, animales, tarifas, dashboard
│   ├── tests/                  # suite pytest (API REST, integracion, backup, port)
│   ├── requirements.txt
│   └── run_server.py           # entry point para PyInstaller (respeta PESEBRERA3L_PORT)
├── electron/
│   ├── main.js                 # main Electron: spawn del backend + IPC (api:invoke, settings:get/set)
│   ├── preload.js              # contextBridge: electronAPI.invokeApi/getSettings/setSettings
│   ├── lib/port.js             # validacion de puerto (compartida con pruebas)
│   ├── renderer/
│   │   ├── index.html          # HTML5 semantico (incl. panel de control)
│   │   ├── styles/             # base.css + themes.css (5 temas x 3 modos + daltonismo)
│   │   └── js/                 # theme-engine.js (ThemeEngine) + app.js
├── scripts/build-backend-exe.ps1
├── tests/frontend/             # node --test
├── docs/fases/                 # planeacion y actas por fase (IEEE 830)
└── release/Pesebrera3L-Desk-1.0.0-portable.exe  # artefacto (LFS)
```

## ERS

Ver `IEEE-830-(3L).md` en la raiz (fuente de verdad) y `docs/fases/` para el seguimiento por fases.