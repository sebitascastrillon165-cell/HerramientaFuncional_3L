# QA - Rediseno de interfaz "Establo Premium" (Fase 9D)

**Proyecto:** Pesebrera3L-Desk
**Fecha de ejecucion:** 2026-11-11
**Entorno:** Windows 10/11 x64, Electron 45.2.3, Node 26, Python 3.15.2, SQLite local.

## 1. Resumen de resultados

| Suite | Pruebas | Resultado |
| :--- | :--- | :--- |
| Frontend unitarias (`node --test`) | 26 | 26 aprobadas |
| Backend (`pytest`) | 20 | 20 aprobadas |
| E2E Electron (`playwright-core`) | 1 flujo completo | Aprobado |

## 2. Cobertura de las pruebas unitarias nuevas

### `tests/frontend/ui-contracts.test.cjs`
- Todo ID usado por `app.js` existe en `index.html` (incluye `apiStatus`, `footerPort`, etc.).
- Las seis vistas del contrato (`dashboard`, `stables`, `animals`, `riders`, `tariffs`, `control`)
  conservan su entrada de navegacion.
- Las opciones de tema (5), modo (3) y daltonismo (4) siguen intactas.
- Todos los controles de formulario tienen etiqueta visible (`label for`).
- No se usan recursos externos ni CDN.
- El CSS define foco visible, movimiento reducido, estados vacios y el indicador de API.

### `tests/frontend/design-tokens.test.cjs`
- Existen los 5 temas en los 3 modos (15 combinaciones) con todos los tokens de color.
- Alto contraste usa negro sobre blanco y elimina degradados/sombras.
- Existen los 3 perfiles de daltonismo.
- Los tokens derivados (`--shadow-tint`, `--scheme`, `--brand-gradient`) existen por modo.

## 3. Flujo E2E ejecutado (`tests/e2e/ui-smoke.cjs`)

1. Arranque del backend y espera de `#apiStatus[data-state="ok"]`.
2. Verificacion de las 6 vistas y de los valores numericos del dashboard.
3. Alta de pesebrera (`QA Box <sufijo>`), montador, animal y tarifa contra la API real.
4. Verificacion de filas creadas y de la barra de ocupacion en el dashboard.
5. Cambio a tema Noche / Oscuro / Protanopia y persistencia tras recargar.
6. Panel de control: cambio de puerto 8877 -> 8878, verificacion de `getSettings` y de
   `GET /api/v1/health` en el puerto nuevo.
7. Retorno a Pampa/Claro/Ninguno y captura final.

Las capturas de evidencia estan en `docs/qa/`:

- `01-dashboard-pampa-light.png`
- `02-dashboard-noche-dark.png`
- `03-pesebreras-pampa-light.png`

## 4. Defectos encontrados y corregidos durante la QA

| # | Defecto | Impacto | Correccion |
| :--- | :--- | :--- | :--- |
| 1 | `backendEnvironment()` sobreescribia `PESEBRERA3L_DATA`/`PESEBRERA3L_BACKUP` | Aislamiento de datos en pruebas y soporte | Se respetan las variables de entorno si existen (`electron/main.js`). |
| 2 | `invokeApi` convertia cualquier respuesta HTTP 4xx/5xx en "No se pudo conectar" | Mensaje de error enganoso (p. ej. 409 real) | Los errores de red se reintentan; las respuestas HTTP conservan su `detail` (`electron/main.js`). |
| 3 | `fa-user-riding` no existe en Font Awesome 7 (icono vacio) | Menu y tarjeta sin icono | Se reemplazo por `fa-hat-cowboy` en `index.html`. |
| 4 | Captura del dashboard tomada durante el fade-in (contenido invisible) | Falso negativo de QA | Se anadio espera de 400 ms antes de la captura. |

## 5. Rendimiento observado

- Cambio de tema/vista: por debajo de 200 ms (CSS + atributos de datos, una sola animacion).
- Llamadas locales: respuestas de milisegundos (FastAPI + SQLite) dentro del umbral de 300 ms.

## 6. Limitaciones

- La verificacion visual final del `.exe` empaquetado se ejecuta en la Fase 9E con el mismo
  flujo E2E apuntando a `release/win-unpacked/Pesebrera3L Desk.exe`.
- El comportamiento visual en monitores de alto DPI puede variar; el layout es fluido.
