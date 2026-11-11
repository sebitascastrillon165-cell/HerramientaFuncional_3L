# Fase 9B - Diseno del Sistema Visual "Establo Premium"

**Proyecto:** Pesebrera3L-Desk
**Estandar de referencia:** IEEE Std 830-1998
**Concepto:** interfaz de escritorio moderna, calida y ecuestre, con acabado premium (cuero, laton y
luz de establo), sin sacrificar legibilidad ni accesibilidad. Toda la funcionalidad se conserva.

## 1. Principios de diseno

1. **Jerarquia clara:** marca, contexto y accion visibles en cada pantalla.
2. **Consistencia:** un unico sistema de tokens para color, radio, sombra, espaciado y tipografia.
3. **Tacto y profundidad:** superficies elevadas, bordes suaves y sombras calidas discretas.
4. **Accesibilidad primero:** foco visible, contraste AA, movimiento reducible y paletas para daltonismo.
5. **Contratos intactos:** mismos IDs, clases y flujos que consume `app.js` (ver Fase 9A).

## 2. Tokens de diseno

### 2.1 Tipografia

- Familia: `"Segoe UI Variable Display", "Segoe UI", system-ui, -apple-system, sans-serif`.
- Escala: `--text-xs 12px`, `--text-sm 13px`, `--text-md 15px`, `--text-lg 18px`,
  `--text-xl 22px`, `--text-2xl 28px`, `--text-display 34px`.
- Titulos con `letter-spacing: -0.01em` y peso 700; etiquetas en mayusculas con `--text-xs`.

### 2.2 Espaciado y radios

- Espaciado base 4 px: `--space-1..8` (4, 8, 12, 16, 20, 24, 32, 40).
- Radios: `--radius-sm 8px`, `--radius-md 12px`, `--radius-lg 18px`, `--radius-pill 999px`.

### 2.3 Color

- Se conservan las 5 paletas (pampa, noche, valle, luna, rio) y sus modos claro/oscuro/alto contraste.
- Tokens derivados por `color-mix()` a partir de `--primary`, `--accent`, `--surface`, `--text`:
  `--brand-gradient`, `--surface-glow`, `--shadow`, `--ring`.
- Tokens por modo: `--shadow-tint`, `--glow-tint`, `--scheme` (`color-scheme`), `--veil`.
- Alto contraste: gradientes planos, sombras nulas, bordes de 2 px y foco negro/blanco.
- Daltonismo: los 3 perfiles ya existentes se conservan y ahora tambien tiñen iconos y graficos.

## 3. Layout

```
+--------------------------------------------------------------+
| HEADER (glass): marca | pill Tema / Modo / Daltonismo | API  |
+---------------+----------------------------------------------+
| SIDEBAR       | CONTENT                                      |
| nav pills     |  section header (titulo + subtitulo)         |
| estado API    |  paneles, tarjetas KPI, tablas, formularios  |
| version       |                                              |
+---------------+----------------------------------------------+
| FOOTER: leyenda | estado de sincronizacion                     |
+--------------------------------------------------------------+
```

- `body` pasa de flex-column a CSS Grid con areas `header / sidebar content / footer`.
- Sidebar fija de 264 px con degradado sutil y borde derecho; colapsa a barra horizontal en < 900 px.
- Header con `backdrop-filter: blur(14px)` y borde inferior de 1 px.

## 4. Componentes

| Componente | Tratamiento |
| :--- | :--- |
| Marca | Tile con degradado primario y `fa-horse-head`; titulo + subtitulo. |
| Selector de tema | Tres "chips" etiquetados (Tema, Modo, Daltonismo) con selects estilizados. |
| Estado API | Chip con punto animado: verde (activa), ambar (iniciando), rojo (sin conexion). |
| Nav item | Pill con icono, hover elevado, activo con degradado, barra indicadora y brillo. |
| KPI card | Tile de icono + etiqueta + valor animado + microcopy. |
| Ocupacion | Lista con barra de progreso por pesebrera. |
| Formularios | Panel con grilla responsiva, etiquetas visibles y boton primario de ancho completo en movil. |
| Tablas | Tarjeta con cabecera fija, filas alternas, hover y estado vacio con `:has(tbody:empty)`. |
| Alertas | SweetAlert2 reestilizado con tokens (radio, sombra, tipografia y botones). |
| Footer | Leyenda + version + chip de estado. |

## 5. Movimiento

- Cambio de vista: `fade + translateY(6px)` en 220 ms.
- Hover de tarjetas/nav: elevacion 2 px y sombra en 160 ms.
- Contadores KPI animados con `requestAnimationFrame` (600 ms) salvo `prefers-reduced-motion`.
- Punto de estado con pulso de 2 s (desactivado en movimiento reducido).

## 6. Accesibilidad

- `:focus-visible` con anillo de 2 px y offset 2 px en todos los interactivos.
- Etiquetas `<label for>` visibles en formularios.
- `aria-current="page"` en la vista activa; `role="status"` en mensajes.
- Contraste minimo AA en los 15 pares tema/modo; alto contraste en negro/blanco puro.
- Areas tactiles >= 40 px.

## 7. Cambios tecnicos previstos

- `index.html`: reescritura estructural manteniendo IDs, clases y orden de scripts.
- `base.css`: reescritura completa orientada a tokens y componentes.
- `themes.css`: se conservan las paletas y se anaden tokens derivados por modo.
- `app.js`: solo mejoras no destructivas (contadores, barras de ocupacion, chip de estado).
- Nuevos tests: contratos de IDs, tokens por tema/modo/daltonismo y ausencia de CDN.

## 8. Criterios de aceptacion

1. Las 6 vistas funcionan y los 4 formularios registran datos contra la API real.
2. Los 5 temas y 3 modos cambian en tiempo real y persisten.
3. Los 3 perfiles de daltonismo se aplican sin perder contraste.
4. Ningun ID/clase del contrato de Fase 9A desaparece.
5. E2E sobre el ejecutable empaquetado sin errores de consola.
