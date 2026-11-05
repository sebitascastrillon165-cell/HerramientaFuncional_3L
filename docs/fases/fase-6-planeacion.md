# Fase 6 — Planeación: Integración IPC

**Proyecto:** Pesebrera3L-Desk
**Documento fuente:** `IEEE-830-(3L).md` (ERS v1.0.0)
**Estándar de referencia:** IEEE Std 830-1998
**Fecha:** 2026-11-05

---

## 1. Objetivos de la fase

1. Verificar el puente IPC entre el renderer de Electron y el núcleo Python.
2. Verificar que el proceso principal de Electron pueda iniciar el servidor FastAPI local.
3. Asegurar que `will-quit` detenga el backend Python.

## 2. Requisitos IEEE 830 considerados

| ID | Descripción | Módulo | Prioridad |
| :--- | :--- | :--- | :--- |
| RF-09 | Comunicación externa vía API REST local. | IPC | Media |
| RNF-03 | Respaldo automático al cierre. | IPC | Alta |

## 3. Entregables de la fase

- Verificación de la integración Electron ↔ Python.
- `docs/fases/fase-6-planeacion.md` y `docs/fases/fase-6-acta.md`.

## 4. Criterios de aceptación

- `npx electron --version` funciona tras la instalación.
- El código IPC (`main.js`, `preload.js`, `app.js`) es sintácticamente válido.

## 5. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| Entorno CLI sin pantalla (GUI de Electron no launchable) | Alta | Media | Verificación por revisión y pruebas de backend |

---

**Estado:** Fase 6 cerrada. Ver `docs/fases/fase-6-acta.md`.