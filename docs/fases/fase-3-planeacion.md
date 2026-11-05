# Fase 3 — Planeación: Diseño de Base de Datos y API

**Proyecto:** Pesebrera3L-Desk
**Documento fuente:** `IEEE-830-(3L).md` (ERS v1.0.0)
**Estándar de referencia:** IEEE Std 830-1998
**Fecha:** 2026-11-05

---

## 1. Objetivos de la fase

1. Diseñar el esquema lógico de la base de datos SQLite (tablas y relaciones).
2. Definir el contrato de la API REST local.
3. Definir los servicios de negocio (ocupación, asignación, tarifas, dashboard).

## 2. Requisitos IEEE 830 considerados

| ID | Descripción | Módulo | Prioridad |
| :--- | :--- | :--- | :--- |
| RF-01 | Pesebreras disponibles/llenas. | Datos | Alta |
| RF-02 | Equinos/mulares vinculados a pesebrera y montador. | Datos | Alta |
| RF-03 | Montadores y carga exacta. | Datos | Alta |
| RF-04 | Tarifas y precios. | Datos | Media |
| RF-09 | API REST local (FastAPI). | API | Media |
| RNF-02 | Operaciones locales ≤ 300 ms. | Rendimiento | Alta |
| RNF-03 | Integridad referencial y respaldo. | Datos | Alta |

## 3. Entregables de la fase

- `docs/fases/fase-3-planeacion.md`
- `docs/fases/fase-3-acta.md`
- Esquema SQLite y contrato API definidos.

## 4. Criterios de aceptación

- Todas las tablas con claves foráneas y restricciones definidas.
- Endpoints REST documentados.

## 5. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| Falta de normalización | Media | Medio | Definir modelo relacional 1:N |

---

**Estado:** Fase 3 cerrada. Ver `docs/fases/fase-3-acta.md`.