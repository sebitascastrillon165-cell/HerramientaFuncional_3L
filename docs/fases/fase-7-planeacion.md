# Fase 7 — Planeación: Pruebas Automatizadas

**Proyecto:** Pesebrera3L-Desk
**Documento fuente:** `IEEE-830-(3L).md` (ERS v1.0.0)
**Estándar de referencia:** IEEE Std 830-1998
**Fecha:** 2026-11-05

---

## 1. Objetivos

1. Automatizar las pruebas de lógica de negocio y API REST con pytest.
2. Validar el motor de temas y el HTML semántico con node --test.
3. Verificar el respaldo automático de datos al cierre (RNF-03).

## 2. Requisitos IEEE 830 considerados

| ID | Descripción | Módulo | Prioridad |
| :--- | :--- | :--- | :--- |
| RF-01..RF-04 | Lógica de pesebreras, animales, montadores, tarifas. | Pruebas | Alta/Media |
| RF-05..RF-08 | HTML semántico y temas. | Pruebas | Alta |
| RNF-03 | Respaldo automático. | Pruebas | Alta |

## 3. Entregables

- `backend/tests/` (pytest)
- `tests/frontend/` (node --test)
- `docs/fases/fase-7-planeacion.md` y `docs/fases/fase-7-acta.md`

## 4. Criterios de aceptación

- Todas las pruebas pasan.
- Se demuestra el bloqueo por pesebrera llena (409) y el respaldo al cierre.

## 5. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| Falsos positivos por integración TestClient | Media | Medio | DB temporal por prueba con tmp_path |

---

**Estado:** Fase 7 cerrada. Ver `docs/fases/fase-7-acta.md`.