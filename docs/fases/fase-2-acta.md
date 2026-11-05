# Fase 2 — Acta de Cierre: Diseño de Arquitectura

**Proyecto:** Pesebrera3L-Desk
**Estándar de referencia:** IEEE Std 830-1998
**Fecha:** 2026-11-05

---

## 1. Resultado obtenido

Se aprobó el diseño de arquitectura de tres capas:

1. **Capa de presentación:** Electron (main + preload + renderer) con HTML5 semántico CSS3, Font Awesome y SweetAlert.
2. **Capa de comunicación:** Puente IPC (Electron → Python) que serializa peticiones REST locales hacia el servidor FastAPI.
3. **Capa de dominio:** Python (FastAPI + SQLite) con servicios de negocio y respaldo automático.

## 2. Requisitos cumplidos y pendientes

- **Cumplidos:** RF-05 (estructura semántica), RF-09 (API REST local), RNF-01, RNF-03 (diseño prepara cumplimiento).
- **Pendientes:** Implementación de los puente y servidores en fases siguientes.

## 3. Decisiones tomadas

- Usar FastAPI como implementación de la API REST local.
- Usar SQLite con claves foráneas y `PRAGMA foreign_keys=ON`.

## 4. Pruebas ejecutadas

| Prueba | Resultado |
| :--- | :--- |
| Revisión de la arquitectura propuesta | Aprobada |

## 5. Evidencias

- Esta acta: `docs/fases/fase-2-acta.md`

---

**Fase 2 cerrada. Inicio autorizado de la Fase 3 (Diseño de base de datos y API).**
