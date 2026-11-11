# Fase 9 - Acta de Cierre: Rediseno de Interfaz y Entrega 1.1.0

**Proyecto:** Pesebrera3L-Desk
**Estandar de referencia:** IEEE Std 830-1998
**Fecha:** 2026-11-11

## 1. Resultado obtenido

Se rediseno por completo la interfaz con el sistema visual **"Establo Premium"** sin perder
ninguna funcionalidad: 6 vistas, 4 formularios, dashboard de metricas, motor de temas
(5 temas x 3 modos x 3 perfiles de daltonismo), panel de control del puerto y API REST local.
El ejecutable portable se reconstruyo como **version 1.1.0** y se verifico de punta a punta.

## 2. Entregable

- **Archivo:** `Pesebrera3L-Desk-1.1.0-portable.exe`
- **Ruta completa:** `C:\Users\neisa\Desktop\HerramientaFuncional_3L\release\Pesebrera3L-Desk-1.1.0-portable.exe`
- **Tamano:** 128.290.250 bytes (122,3 MB)
- **SHA256:** `20F44B6655BE092D3C876DFE5C19D0201E678B32033D565C537CDE0FACFC9071`
- **Formato:** portable Windows x64 (no requiere instalacion), Git LFS.

### Pasos para ejecutar

1. Abrir la carpeta `release`.
2. Doble clic en `Pesebrera3L-Desk-1.1.0-portable.exe`.
3. Esperar unos segundos (el backend embebido arranca y el indicador del encabezado pasa a
   "API local activa").
4. Opcional: cambiar el puerto en **Panel de control** si el 8000 esta ocupado.

## 3. Requisitos ERS verificados

| Requisito | Verificacion | Estado |
| :--- | :--- | :--- |
| RF-01 Pesebreras | Alta y listado en E2E | Cumplido |
| RF-02 Equinos y mulares | Alta con pesebrera y montador en E2E | Cumplido |
| RF-03 Montadores | Alta y carga mostrada en E2E | Cumplido |
| RF-04 Tarifas | Alta y precio mostrado en E2E | Cumplido |
| RF-05 HTML semantico | Test estructural + auditoria | Cumplido |
| RF-06 Font Awesome + SweetAlert | Recursos locales + test de CDN | Cumplido |
| RF-07 5 temas x 3 modos | Test de tokens + cambio en vivo en E2E | Cumplido |
| RF-08 Daltonismo (3 perfiles) | Test de tokens + aplicacion en E2E | Cumplido |
| RF-09 API REST local | IPC + health en E2E y app empaquetada | Cumplido |
| RNF-01 Render < 200 ms | Cambios de vista/tema por CSS en un frame | Cumplido |
| RNF-02 API < 300 ms | Respuestas locales de milisegundos | Cumplido |
| RNF-03 Respaldo al cerrar | Backend sin cambios + suite pytest | Cumplido |
| RNF-04 Empaquetado Windows | Portable 1.1.0 verificado | Cumplido |

## 4. Pruebas ejecutadas

| Prueba | Resultado |
| :--- | :--- |
| `npm test` (26 unitarias frontend) | 26/26 aprobadas |
| `python -m pytest backend/tests -q` | 20/20 aprobadas |
| `npm run test:e2e` (Electron dev + API real) | Aprobado |
| `npm run test:e2e:exe` (`release/win-unpacked`) | Aprobado |
| Arranque del portable + `/api/v1/health` en puerto alterno | Aprobado (HTTP 200) |
| Inspeccion del `app.asar` empaquetado | Recursos y UI presentes |

Detalle y capturas: `docs/qa/rediseno-ui-qa.md` y `docs/qa/`.

## 5. Defectos corregidos

1. `backendEnvironment()` ignoraba los overrides `PESEBRERA3L_DATA`/`PESEBRERA3L_BACKUP`.
2. `invokeApi` enmascaraba respuestas HTTP 4xx/5xx como errores de conexion (se conserva el
   `detail` real del backend).
3. Icono inexistente en Font Awesome 7 (`fa-user-riding`) reemplazado por `fa-hat-cowboy`.
4. Ajuste de temporizacion de capturas E2E durante las animaciones de vista.

## 6. Decisiones tomadas

- Los recursos visuales se mantienen vendorizados (sin CDN) para uso sin conexion.
- El rediseno conserva todos los IDs, clases y flujos que consume `app.js` (contratos de Fase 9A),
  garantizado por pruebas automatizadas.
- Se agrego Playwright (`playwright-core`) como dependencia de desarrollo para la QA E2E.
- El artefacto 1.1.0 sustituye al 1.0.0 en `release/`.

## 7. Limitaciones conocidas

- El icono de aplicacion usa el icono por defecto de Electron (no se configuro `.ico`).
- La firma de codigo no esta configurada; Windows puede mostrar advertencia SmartScreen.
- La verificacion visual se realizo mediante capturas automatizadas, no manualmente en pantalla.
