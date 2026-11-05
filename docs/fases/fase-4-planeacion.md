# Fase 4 — Planeación: Implementación del Backend

**Proyecto:** Pesebrera3L-Desk
**Documento fuente:** `IEEE-830-(3L).md` (ERS v1.0.0)
**Estándar de referencia:** IEEE Std 830-1998
**Fecha:** 2026-11-05

---

## 1. Objetivos de la fase

1. Implementar el núcleo Python (FastAPI) con persistencia SQLite.
2. Implementar servicios de negocio: pesebreras, animales/mulares, montadores y tarifas.
3. Implementar el servicio de dashboard.
4. Implementar respaldo automático de la base de datos al cierre.

## 2. Requisitos IEEE 830 considerados

| ID | Descripción | Módulo | Prioridad |
| :--- | :--- | :--- | :--- |
| RF-01 | Pesebreras disponibles/llenas. | Backend | Alta |
| RF-02 | Equinos/mulares vinculados. | Backend | Alta |
| RF-03 | Montadores y carga. | Backend | Alta |
| RF-04 | Tarifas. | Backend | Media |
| RF-09 | API REST local. | Backend | Media |
| RNF-02 | Operaciones locales <= 300 ms. | Backend | Alta |
| RNF-03 | Integridad referencial y respaldo. | Backend | Alta |

## 3. Entregables de la fase

- `backend/app/` (FastAPI, SQLite, servicios).
- `backend/requirements.txt`.

## 4. Criterios de aceptación

- El servidor arranca sin errores.
- Endpoints REST responden correctamente.

## 5. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| Errores de serializacion Pydantic | Alta | Alto | Validar con pruebas |

---

**Estado:** Fase 4 cerrada. Ver `docs/fases/fase-4-acta.md`.