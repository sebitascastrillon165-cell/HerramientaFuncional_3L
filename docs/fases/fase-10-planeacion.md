# Fase 10 - Planeacion: Altas por Lote, Eliminaciones y Disponibilidad de Montadores

**Proyecto:** Pesebrera3L-Desk
**Estandar de referencia:** IEEE Std 830-1998
**Fecha:** 2026-11-11

## 1. Objetivo

Ampliar la funcionalidad operativa manteniendo intacto el rediseno de la Fase 9:

1. **RF-01 ampliado:** registrar pesebreras en lote indicando una cantidad (p. ej. 20).
2. **RF-10 (nuevo):** eliminar animales (caballos/mulas), pesebreras y montadores del sistema,
   con confirmacion del usuario.
3. **RF-03 ampliado:** al asignar un montador a un animal, escoger si queda **disponible o no**
   para montar mas caballos.

## 2. Analisis del estado actual

- `animales` ya tiene `DELETE /api/v1/animales/{id}` implementado y probado.
- `pesebreras` y `montadores` **no** tienen endpoint de eliminacion.
- `montadores.disponible` existe en la tabla y en `PUT /api/v1/montadores/{id}`, pero la UI no
  permite fijarlo al asignar un animal.
- El alta de pesebreras acepta una sola unidad (`PesebreraCreate`).
- Las claves foraneas de `animales` usan `ON DELETE SET NULL` para pesebrera y montador.

## 3. Diseno de la solucion

### 3.1 Altas por lote

- `PesebreraCreate.cantidad: int = 1` (1..100).
- `cantidad == 1`: respuesta igual que hoy (objeto creado) para compatibilidad.
- `cantidad > 1`: se crean `"<nombre> 1" ... "<nombre> N"` en una sola transaccion y se responde
  `{ "creadas": [...], "total": N }`.
- Si algun nombre generado ya existe, la transaccion completa se revierte (409).

### 3.2 Eliminaciones

| Recurso | Endpoint | Efecto en datos |
| :--- | :--- | :--- |
| Animal | `DELETE /api/v1/animales/{id}` (ya existe) | Libera cupo y recalcula estado de la pesebrera. |
| Pesebrera | `DELETE /api/v1/pesebreras/{id}` (nuevo) | Animales quedan sin pesebrera y en estado `disponible`. |
| Montador | `DELETE /api/v1/montadores/{id}` (nuevo) | Animales quedan sin montador asignado. |

La UI pide confirmacion con SweetAlert antes de eliminar.

### 3.3 Disponibilidad al asignar montador

- `AnimalCreate`/`AnimalUpdate` aceptan `montador_disponible: bool | None`.
- Si se envia y hay montador, se actualiza `montadores.disponible` en la misma operacion.
- La UI muestra un selector "Disponibilidad del montador" que se sincroniza con el montador
  elegido y envia `montador_disponible`.
- `GET /api/v1/animales/` agrega `pesebrera_nombre`, `montador_nombre` y `montador_disponible`
  (campos aditivos, sin romper contratos).

## 4. Cambios por capa

- **Backend:** `schemas.py`, `stables_service.py`, `riders_service.py`, `animals_service.py`,
  routers de pesebreras/montadores, pruebas pytest nuevas.
- **Frontend:** campo Cantidad, selector de disponibilidad, columna de acciones con botones de
  eliminacion, nombres en la tabla de animales, estilos de acciones y confirmaciones.
- **Pruebas:** pytest (lote, rollback, eliminaciones, disponibilidad) + contratos de UI + E2E
  Playwright (lote de 3, disponibilidad, eliminacion de los tres recursos).
- **Empaquetado:** reconstruir backend congelado y portable **1.2.0**.

## 5. Criterios de aceptacion

1. Crear 20 pesebreras en una sola operacion y verlas listadas.
2. Un lote con nombres duplicados no deja registros parciales.
3. Eliminar animal, pesebrera y montador desde la UI (con confirmacion) y verificar el estado
   coherente (sin huerfanos ni estados inconsistentes).
4. Asignar un montador a un caballo marcandolo "No disponible" y ver reflejado el cambio en la
   tabla de montadores.
5. Todas las suites (unitarias, backend, E2E empaquetado) en verde.
