# Fase 3 — Acta de Cierre: Diseño de Base de Datos y API

**Proyecto:** Pesebrera3L-Desk
**Estándar de referencia:** IEEE Std 830-1998
**Fecha:** 2026-11-05

---

## 1. Resultado obtenido

Se cerró el diseño de base de datos y API: esquema SQLite relacional (tarifas, pesebreras, montadores,
animales) con integridad referencial y contrato REST inicial.

## 2. Requisitos cumplidos y pendientes

- **Cumplidos:** RF-01 a RF-04 parcialmente (diseño), RF-09 (contrato API), RNF-02, RNF-03 (diseño).
- **Pendientes:** Implementación de los endpoints y pruebas (Fases 4-7).

## 3. Decisiones tomadas

- FastAPI + SQLite con `sqlite3` estándar.
- Claves foráneas con `PRAGMA foreign_keys=ON`.

## 4. Pruebas ejecutadas

| Prueba | Resultado |
| :--- | :--- |
| Revisión de diseño BD/API | Aprobada |

## 5. Evidencias

- Esta acta: `docs/fases/fase-3-acta.md`

---

**Fase 3 cerrada. Inicio autorizado de la Fase 4 (Implementación del backend).**
