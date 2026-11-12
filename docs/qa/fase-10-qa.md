# QA Fase 10 - Altas por lote, eliminaciones y disponibilidad de montadores

Fecha: 2026-11-12

## Alcance verificado

- Alta de pesebreras por cantidad (1-100) con nombres automaticos "Nombre 1..N".
- Rollback completo y respuesta 409 cuando un nombre generado ya existe.
- Eliminacion de animales desde la tabla.
- Eliminacion de pesebreras con desasignacion de animales (`pesebrera_id = NULL`, estado `disponible`).
- Eliminacion de montadores con desasignacion de animales (`montador_id = NULL`).
- Seleccion de disponibilidad del montador al asignarlo a un animal.
- Tabla de animales mostrando nombres de pesebrera y montador.

## Pruebas automatizadas

| Suite | Comando | Resultado |
| --- | --- | --- |
| Backend | `python -m pytest backend/tests -q` | 30 passed |
| Frontend | `npm test` | 30 passed |
| E2E Electron | `npm run test:e2e` | Aprobada |

Casos nuevos de backend:

- `test_crear_pesebreras_por_cantidad` (lote de 20).
- `test_cantidad_fuera_de_rango_es_rechazada` (422 con cantidad 101).
- `test_lote_con_duplicados_no_deja_registros_parciales` (409 sin residuos).
- `test_eliminar_pesebrera_desasigna_animales` y 404 en pesebrera inexistente.
- `test_eliminar_montador_desasigna_animales` y 404 en montador inexistente.
- `test_marcar_montador_no_disponible_al_asignar`.
- `test_cambiar_disponibilidad_al_actualizar_animal`.
- `test_listar_animales_incluye_nombres`.

Flujo E2E cubierto:

1. Creacion de un lote de 3 pesebreras desde la UI.
2. Registro de montador y animal asignado con disponibilidad "No disponible".
3. Verificacion de nombres de pesebrera/montador en la tabla de animales.
4. Verificacion del estado "No" del montador en su tabla.
5. Eliminacion con confirmacion de una pesebrera, un animal y un montador.

## Evidencia visual

- `docs/qa/04-altas-por-lote.png`: lote de 3 pesebreras recien creado.
- `docs/qa/01-dashboard-pampa-light.png`: panel actualizado tras las altas.
- `docs/qa/02-dashboard-noche-dark.png`: tema noche/dark con datos de la fase.
- `docs/qa/03-pesebreras-pampa-light.png`: vista de pesebreras al cierre del flujo.

## Limitaciones

- Las eliminaciones no se pueden deshacer (la confirmacion advierte el efecto).
- Edicion de animales/pesebreras/montadores sigue fuera de alcance (no estaba en la ERS).
- Icono propio y firma de codigo continúan pendientes (heredado de fases previas).
