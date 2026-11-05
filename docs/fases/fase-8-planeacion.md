# Fase 8 — Planeación: Empaquetado y Entrega

**Proyecto:** Pesebrera3L-Desk
**Documento fuente:** `IEEE-830-(3L).md` (ERS v1.0.0)
**Estándar de referencia:** IEEE Std 830-1998
**Fecha:** 2026-11-05

---

## 1. Objetivos

1. Construir el ejecutable portal .exe para Windows 10/11 x64.
2. Construir el nucleo Python congelado con PyInstaller.
3. Preparar la entrega en el repositorio remoto.
4. Completar el README y la documentacion de fases.

## 2. Requisitos IEEE 830 considerados

| ID | Descripción | Módulo | Prioridad |
| :--- | :--- | :--- | :--- |
| RNF-03 | Empaquetado Windows portable; integridad referencial; respaldo al cierre. | Empaquetado | Alta |
| RNF-04 | Mantenibilidad y portabilidad. | Entregable | Media |
| RF-09 | API REST local interoperable. | API | Media |

## 3. Entregables

- `release/Pesebrera3L-Desk-1.0.0-portable.exe`
- `dist/pesebrera3l-backend.exe` (artefacto intermedio)
- `README.md`, `.gitignore`, `.gitattributes`, `scripts/build-backend-exe.ps1`
- `docs/fases/fase-8-planeacion.md` y `docs/fases/fase-8-acta.md`

## 4. Criterios de aceptación

- El .exe portable se genera y arranca.
- El backend congelado responde en `/api/v1/health`.

## 5. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| Artefacto superior a 100 MB (límite GitHub) | Alta | Alto | Git LFS |

---

**Estado:** Fase 8 cerrada. Ver `docs/fases/fase-8-acta.md`.