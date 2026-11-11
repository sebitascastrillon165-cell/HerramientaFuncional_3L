# Fase 9A - Analisis de la UI actual y Contratos de Compatibilidad

**Proyecto:** Pesebrera3L-Desk
**Estandar de referencia:** IEEE Std 830-1998
**Objetivo de la fase:** inventariar la interfaz existente y fijar los contratos que el rediseno
debe preservar para no romper ninguna capacidad entregada en las fases 1 a 8.

## 1. Inventario de la interfaz actual

| Archivo | Rol |
| :--- | :--- |
| `electron/renderer/index.html` | Estructura semantica HTML5 (header, aside.sidebar, main.content, footer) con 6 vistas. |
| `electron/renderer/styles/base.css` | Layout y componentes basicos (207 lineas). |
| `electron/renderer/styles/themes.css` | 5 temas x 3 modos + 3 paletas de daltonismo (237 lineas). |
| `electron/renderer/js/theme-engine.js` | Normaliza y aplica `data-theme`, `data-mode`, `data-dichromacy`. |
| `electron/renderer/js/app.js` | Navegacion entre vistas, consumo de la API via IPC, formularios y temas. |
| `electron/renderer/vendor/` | Font Awesome 7 y SweetAlert2 empaquetados localmente (offline). |

## 2. Contratos de compatibilidad (no negociables)

### 2.1 Estructura semantica (RF-05)

- `<header class="app-header" id="appHeader">`
- `<aside class="sidebar" id="sidebar">` con `<nav id="sidebarNav">`
- `<main class="content" id="content">`
- `<footer class="app-footer">`

Verificado por `tests/frontend/semantic-html.test.cjs`.

### 2.2 Identificadores consumidos por `app.js`

| Grupo | IDs |
| :--- | :--- |
| Navegacion | `sidebarNav`, `sidebar` |
| Temas | `themeSelect`, `modeSelect`, `dichromacySelect` |
| Dashboard | `statStallsTotal`, `statStallsAvailable`, `statStallsFull`, `statRidersActive`, `statRidersAvailable`, `statAnimalsTotal`, `animalsByStall` |
| Pesebreras | `formStall`, `stallName`, `stallCapacity`, `stallsTbody` (tabla `stallsTable`) |
| Animales | `formAnimal`, `animalType`, `animalName`, `animalRaza`, `animalSexo`, `animalStall`, `animalRider`, `animalsTbody` (tabla `animalsTable`) |
| Montadores | `formRider`, `riderName`, `riderPhone`, `ridersTbody` (tabla `ridersTable`) |
| Tarifas | `formTariff`, `tariffName`, `tariffPrice`, `tariffsTbody` (tabla `tariffsTable`) |
| Panel de control | `formPort`, `apiPort`, `portStatus` |

### 2.3 Clases y atributos funcionales

- `.view` / `.view.active`: visibilidad de vistas administrada por `switchView()`.
- `.nav-item` / `.nav-item.active` con `data-view` = `dashboard|stables|animals|riders|tariffs|control`.
- `.stats-grid`, `.stat-card`, `.list`, `.form`, `.btn`, `.btn-primary`, `.data-table`, `.status-message`.
- IDs de vista: `view-dashboard`, `view-stables`, `view-animals`, `view-riders`, `view-tariffs`, `view-control`.

### 2.4 Motor de temas (RF-07, RF-08)

- Valores permitidos: temas `pampa|noche|valle|luna|rio`; modos `light|dark|contrast`;
  daltonismo `none|protanopia|deuteranopia|tritanopia`.
- Persistencia en `localStorage` (`pesebrera3l-visual-state`).
- `ThemeEngine` debe seguir exportando `SUPPORTED_THEMES`, `SUPPORTED_MODES`,
  `SUPPORTED_DICHROMACY`, `DEFAULT_STATE`, `normalizeVisualState`, `applyVisualState`.

### 2.5 Integracion (RF-06, RF-09, RNF-03)

- Font Awesome y SweetAlert2 servidos desde `vendor/` local; prohibido CDN.
- API consumida via `window.electronAPI.invokeApi` (IPC) con fallback a `fetch` directo.
- Panel de control usa `getSettings`/`setSettings` y muestra el estado en `#portStatus`.
- El cambio de puerto reinicia el backend (`PESEBRERA3L_PORT`).

## 3. Limitaciones visuales detectadas

1. El layout actual apila sidebar y contenido en vertical (flex column), sin aspecto de aplicacion.
2. Tipografia y espaciados planos; jerarquia visual debil.
3. Tablas y formularios sin contenedores, sin estados vacios ni retroalimentacion visual.
4. Sin indicador de estado de la API local.
5. Sin micro-interacciones, sin foco visible consistente ni respeto a `prefers-reduced-motion`.
6. Las tarjetas KPI no comunican contexto (icono, unidad, tendencia).

## 4. Requisitos ERS que el rediseno debe seguir cumpliendo

| ID | Requisito | Verificacion |
| :--- | :--- | :--- |
| RF-01 | Gestion de pesebreras | Flujo de alta + tabla |
| RF-02 | Equinos y mulares | Formulario y listado |
| RF-03 | Montadores y carga | Listado con conteos |
| RF-04 | Tarifas | Formulario y listado |
| RF-05 | HTML semantico | Test estructural |
| RF-06 | Font Awesome + SweetAlert | Test de recursos locales |
| RF-07 | 5 temas x 3 modos | Test de tokens |
| RF-08 | 3 modos de daltonismo | Test de tokens |
| RF-09 | API REST local | Flujo E2E |
| RNF-01 | Render < 200 ms | Animaciones y cambios de tema en un frame |
| RNF-02 | API local < 300 ms | Medido en QA |
| RNF-03 | Respaldo al cerrar | Sin cambios en backend |
| RNF-04 | Empaquetado Windows | Portable reconstruido |

## 5. Riesgos y mitigacion

| Riesgo | Mitigacion |
| :--- | :--- |
| Romper IDs/clases que usa `app.js` | Test de contratos: todo `$("<id>")` de `app.js` debe existir en el HTML. |
| Perder la paleta de daltonismo | Test que valida los 3 bloques `[data-dichromacy=...]`. |
| Degradar alto contraste | Bloque de tokens planos para `[data-mode="contrast"]`. |
| Depender de red | Recursos `vendor/` locales y test sin URLs externas. |
| Regresion de empaquetado | E2E sobre `release/win-unpacked` antes de publicar el portable. |

## 6. Plan de fases

- **9A** Analisis y contratos (este documento).
- **9B** Diseno del sistema visual (tokens, componentes, lineamientos).
- **9C** Implementacion (HTML semantico, CSS, ajustes de `app.js`).
- **9D** QA: unitarias frontend, backend pytest y E2E con capturas.
- **9E** Empaquetado, verificacion del portable y entrega.

## 7. Cierre de la fase

No se modifica aun ningun archivo funcional. Los contratos de la seccion 2 quedan congelados como
base de verificacion para las fases siguientes.
